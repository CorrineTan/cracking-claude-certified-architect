"""
MCP Client that connects to the customer support MCP server via stdio,
discovers tools, converts them to Anthropic API format, and executes
tool calls.

This is the bridge between the MCP protocol and the Anthropic Messages API.
The client:
  1. Launches the MCP server as a subprocess (stdio transport)
  2. Discovers available tools via the MCP list_tools RPC
  3. Converts MCP tool schemas to Anthropic API tool format
  4. Forwards tool calls to the MCP server and parses results
"""

from __future__ import annotations

import json
import os
import sys
from contextlib import AsyncExitStack

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


_SERVER_SCRIPT = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "mcp_server.py"
)


class MCPToolClient:
    """Async context manager wrapping an MCP client session."""

    def __init__(self) -> None:
        self._stack: AsyncExitStack | None = None
        self._session: ClientSession | None = None
        self._tools_cache: list[dict] | None = None

    async def __aenter__(self) -> MCPToolClient:
        self._stack = AsyncExitStack()
        await self._stack.__aenter__()

        venv_python = os.path.join(
            os.path.dirname(os.path.dirname(_SERVER_SCRIPT)),
            ".venv", "bin", "python",
        )
        python_cmd = venv_python if os.path.exists(venv_python) else sys.executable

        server_params = StdioServerParameters(
            command=python_cmd,
            args=[_SERVER_SCRIPT],
            env={
                **os.environ,
                "SIMULATE_TRANSIENT_ERRORS": os.environ.get(
                    "SIMULATE_TRANSIENT_ERRORS", "0"
                ),
            },
        )

        read, write = await self._stack.enter_async_context(
            stdio_client(server_params)
        )
        self._session = await self._stack.enter_async_context(
            ClientSession(read, write)
        )
        await self._session.initialize()
        return self

    async def __aexit__(self, *exc: object) -> None:
        if self._stack:
            await self._stack.__aexit__(*exc)

    # ── Tool discovery ────────────────────────────────────────────

    async def list_tools_anthropic(self) -> list[dict]:
        """Discover MCP tools and return them in Anthropic API format.

        Anthropic expects:
            {"name": ..., "description": ..., "input_schema": {...}}
        MCP provides:
            tool.name, tool.description, tool.inputSchema
        """
        if self._tools_cache is not None:
            return self._tools_cache

        assert self._session is not None
        result = await self._session.list_tools()

        anthropic_tools: list[dict] = []
        for tool in result.tools:
            anthropic_tools.append({
                "name": tool.name,
                "description": tool.description or "",
                "input_schema": tool.inputSchema,
            })

        self._tools_cache = anthropic_tools
        return anthropic_tools

    # ── Tool execution ────────────────────────────────────────────

    async def call_tool(self, name: str, arguments: dict) -> dict:
        """Call an MCP tool and return the parsed structured result.

        Returns a dict with at minimum {"isError": bool, ...}.
        """
        assert self._session is not None
        result = await self._session.call_tool(name, arguments)

        text_parts = [
            c.text for c in result.content if hasattr(c, "text")
        ]
        raw_text = "".join(text_parts)

        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError:
            parsed = {
                "isError": result.isError,
                "message": raw_text,
            }

        if result.isError and "isError" not in parsed:
            parsed["isError"] = True

        return parsed
