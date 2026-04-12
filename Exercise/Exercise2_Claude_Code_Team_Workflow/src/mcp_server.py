"""
Project-specific MCP server exposing development workflow tools.

Provides tools for querying project metadata and running code quality checks.
Configured in .mcp.json with environment variable expansion for credentials.

Run directly:  python src/mcp_server.py
"""

import json
import os
from typing import Annotated

from mcp.server.fastmcp import FastMCP
from mcp.types import CallToolResult, TextContent
from pydantic import Field

mcp = FastMCP("ProjectWorkflowTools")

# Credential from environment (expanded via .mcp.json)
PROJECT_API_TOKEN = os.environ.get("PROJECT_API_TOKEN", "")


@mcp.tool()
def get_project_stats(
    module: Annotated[
        str,
        Field(description="Module path relative to src/ (e.g., 'api', 'models', 'frontend')."),
    ],
) -> CallToolResult:
    """Get code statistics for a project module.

    Returns line counts, file counts, and test coverage summary
    for the specified module. Use this to understand module size
    before planning changes.

    BOUNDARY: This tool provides read-only statistics. It does NOT
    modify code or run tests. Use run_quality_check for active analysis.
    """
    # Simulated stats
    stats = {
        "api": {"files": 5, "lines": 320, "test_files": 2, "coverage": "78%"},
        "models": {"files": 3, "lines": 180, "test_files": 1, "coverage": "85%"},
        "frontend": {"files": 4, "lines": 250, "test_files": 2, "coverage": "62%"},
    }
    data = stats.get(module)
    if not data:
        return CallToolResult(
            content=[TextContent(type="text", text=json.dumps({
                "isError": True,
                "errorCategory": "validation",
                "message": f"Unknown module '{module}'. Available: api, models, frontend",
            }))],
            isError=True,
        )
    return CallToolResult(
        content=[TextContent(type="text", text=json.dumps({"isError": False, "data": data}))],
        isError=False,
    )


@mcp.tool()
def run_quality_check(
    path: Annotated[
        str,
        Field(description="File or directory path to check (relative to project root)."),
    ],
    check_type: Annotated[
        str,
        Field(description="Type of check: 'lint', 'type-check', or 'complexity'."),
    ] = "lint",
) -> CallToolResult:
    """Run a code quality check on the specified path.

    Supports linting, type checking, and complexity analysis.
    Returns structured findings with severity levels.

    BOUNDARY: This tool runs analysis only. It does NOT auto-fix issues.
    Review findings and apply fixes manually or via Edit.
    """
    # Simulated findings
    findings = {
        "path": path,
        "check_type": check_type,
        "findings": [],
        "summary": f"No issues found in {path} ({check_type})",
    }
    return CallToolResult(
        content=[TextContent(type="text", text=json.dumps({"isError": False, "data": findings}))],
        isError=False,
    )


if __name__ == "__main__":
    mcp.run(transport="stdio")
