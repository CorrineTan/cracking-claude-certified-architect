"""
Test runner for the Multi-Tool Agent with Escalation Logic.

Step 5: Tests with multi-concern messages and various error scenarios
to verify the agent decomposes requests, handles each concern, and
synthesizes unified responses.

Usage:
    python main.py                     # list available scenarios
    python main.py <scenario_name>     # run a single scenario
    python main.py all                 # run all scenarios sequentially

Set SIMULATE_TRANSIENT_ERRORS=1 to enable random transient failures
that exercise the retry logic.
"""

import asyncio
import sys
import traceback

from dotenv import load_dotenv

load_dotenv()

from src.agent import run_agent  # noqa: E402


TEST_SCENARIOS = {
    "1_simple_order_inquiry": {
        "description": "Simple order status check — happy path",
        "message": (
            "Hi, I'm Alice Johnson (alice@example.com). "
            "Can you check the status of my order ORD-1001?"
        ),
        "expected_behaviour": [
            "Agent calls get_customer to verify Alice",
            "Agent calls lookup_order for ORD-1001",
            "Agent reports order details and delivery status",
        ],
    },
    "2_refund_under_threshold": {
        "description": "Refund below $500 — should succeed without escalation",
        "message": (
            "Hi, my name is Bob Smith, email bob@example.com. "
            "I'd like to return my mechanical keyboard from order ORD-1004. "
            "It's not what I expected. Can I get a refund?"
        ),
        "expected_behaviour": [
            "Agent calls get_customer for Bob",
            "Agent calls lookup_order for ORD-1004",
            "Agent calls process_refund (total=$174.98, under $500 threshold)",
            "Hook allows the refund to proceed",
            "Agent reports refund confirmation",
        ],
    },
    "3_refund_over_threshold": {
        "description": "Refund above $500 — hook redirects to escalation",
        "message": (
            "Hello, I'm Alice Johnson (alice@example.com). "
            "I want a full refund for my 4K monitor from order ORD-1002. "
            "It arrived with dead pixels."
        ),
        "expected_behaviour": [
            "Agent calls get_customer for Alice",
            "Agent calls lookup_order for ORD-1002 (total=$699.99)",
            "Agent calls process_refund",
            "Hook BLOCKS the refund (exceeds $500 threshold)",
            "Hook REDIRECTS to escalate_to_human automatically",
            "Agent explains to the customer that the case has been escalated",
        ],
    },
    "4_multi_concern": {
        "description": "Multiple issues in one message — decomposition test",
        "message": (
            "Hi, I'm Alice Johnson, email alice@example.com. I have two issues:\n"
            "1) I need to check the status of order ORD-1001 — I think one of "
            "the items was defective.\n"
            "2) I also want a full refund for order ORD-1002 (the 4K monitor "
            "had dead pixels on arrival).\n"
            "Can you help with both?"
        ),
        "expected_behaviour": [
            "Agent calls get_customer for Alice",
            "Agent calls lookup_order for ORD-1001 AND ORD-1002",
            "Agent addresses concern 1 (order status / defective item)",
            "Agent attempts process_refund for ORD-1002",
            "Hook escalates ORD-1002 refund ($699.99 > $500)",
            "Agent provides a UNIFIED response covering both concerns",
        ],
    },
    "5_invalid_order": {
        "description": "Non-existent order — validation error handling",
        "message": (
            "Hi, I'm bob@example.com. Can you look up order ORD-9999 for me?"
        ),
        "expected_behaviour": [
            "Agent calls get_customer for Bob",
            "Agent calls lookup_order for ORD-9999",
            "Tool returns validation error (order not found)",
            "Agent explains the error to the customer clearly",
        ],
    },
    "6_suspended_account": {
        "description": "Suspended account — permission error handling",
        "message": (
            "Hello, I'm Carol Williams (carol@example.com). "
            "I need a refund for order ORD-1001."
        ),
        "expected_behaviour": [
            "Agent calls get_customer for Carol (status=suspended)",
            "Agent attempts process_refund",
            "Tool returns permission error (account suspended)",
            "Agent explains the restriction and suggests alternatives",
        ],
    },
    "7_explicit_human_request": {
        "description": "Customer requests human agent — immediate escalation",
        "message": (
            "Hi, I'm alice@example.com. I'd like to speak with a human agent "
            "please. My issue is complicated and I'd prefer to explain it to a person."
        ),
        "expected_behaviour": [
            "Agent honours the explicit human request",
            "Agent calls escalate_to_human with reason=customer_request",
            "Agent confirms escalation and provides case/wait info",
        ],
    },
}


async def run_scenario(key: str, scenario: dict) -> None:
    print(f"\n{'#' * 70}")
    print(f"# SCENARIO: {scenario['description']}")
    print(f"# Key: {key}")
    print(f"#")
    print(f"# Expected behaviour:")
    for step in scenario["expected_behaviour"]:
        print(f"#   * {step}")
    print(f"{'#' * 70}")

    try:
        await run_agent(scenario["message"])
    except Exception:
        print(f"\n  ERROR running scenario '{key}':")
        traceback.print_exc()

    print()


async def async_main() -> None:
    if len(sys.argv) < 2:
        print("Multi-Tool Agent with Escalation Logic — Test Scenarios\n")
        print("Available scenarios:")
        for key, s in TEST_SCENARIOS.items():
            print(f"  {key:30s}  {s['description']}")
        print(f"\nUsage:  python main.py <scenario>")
        print(f"        python main.py all")
        print(
            f"\nTip: set SIMULATE_TRANSIENT_ERRORS=1 to test retry logic "
            f"with random backend failures."
        )
        return

    arg = sys.argv[1]

    if arg == "all":
        scenarios = TEST_SCENARIOS
    elif arg in TEST_SCENARIOS:
        scenarios = {arg: TEST_SCENARIOS[arg]}
    else:
        print(f"Unknown scenario: '{arg}'")
        print(f"Available: {', '.join(TEST_SCENARIOS.keys())}, all")
        sys.exit(1)

    for key, scenario in scenarios.items():
        await run_scenario(key, scenario)


def main() -> None:
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
