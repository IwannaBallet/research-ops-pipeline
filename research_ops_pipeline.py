import json
import time
from typing import Dict, Any

import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
USE_MOCK_LLM = False
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

class LLMService:
    """
    Interacts with Google's Gemini API.
    """
    def __init__(self):
        if not USE_MOCK_LLM:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-2.0-flash')

    def generate(self, system_prompt: str, user_input: str) -> str:
        if USE_MOCK_LLM:
            return self._mock_response(system_prompt)
        else:
            try:
                # Gemini 1.5 Flash supports system instructions, but for broadest compatibility 
                # and simple prompting, we'll combine them.
                full_prompt = f"{system_prompt}\n\nINPUT DATA:\n{user_input}"
                response = self.model.generate_content(full_prompt)
                return response.text
            except Exception as e:
                return f"Error calling Gemini API: {str(e)}"

    def _mock_response(self, system_prompt: str) -> str:
        """Returns hardcoded responses for the specific demo example."""
        if "Planner Agent" in system_prompt:
            return "Major complaints: Delivery Delay, App Error. Plan: Analyze causes for delivery delays and app crashes."
        
        elif "Summarizer Agent" in system_prompt:
            return """- Delivery Delay: Average 2 days delay, causing high dissatisfaction.
- App Error: Frequent crashes on the payment screen.
#DeliveryDelay #AppCrash #PaymentFail"""

        elif "Insight Agent" in system_prompt:
            return """Insight: The root cause of delivery delays appears to be logistics infrastructure shortages, while app crashes are technical debt.
Hypothesis: Optimizing logistics and refactoring payment code will reduce churn."""

        elif "Report Agent" in system_prompt:
            return """## Executive Summary
Customers are unhappy with 2-day delivery delays and payment screen crashes.

## Key Issues
- **Payment Stability** (Severity: 9/10): High churn risk due to payment failures.
- **Delivery Speed** (Severity: 7/10): Customer frustration from delays.
- **Support Response** (Severity: 6/10): Negative reviews citing slow support.

## Strategic Recommendation
Invest in logistics infrastructure and fix the payment module immediately."""

        elif "Evaluation Agent" in system_prompt:
            return """{
  "score": 5,
  "rubric_breakdown": {
      "coherence": 5,
      "accuracy": 5,
      "insightfulness": 5,
      "structure": 5
  },
  "feedback": "The report is clear, accurate, and actionable."
}"""
        return "Error: Unknown Agent"

class Agent:
    def __init__(self, name: str, role: str, goal: str, output_format: str, llm: LLMService):
        self.name = name
        self.role = role
        self.goal = goal
        self.output_format = output_format
        self.llm = llm

    def run(self, input_text: str) -> str:
        system_prompt = f"""
ROLE: {self.role}
GOAL: {self.goal}
OUTPUT FORMAT:
{self.output_format}

You must not skip or merge steps. 
Do not comment on the process or break character.
"""
        print(f"[Agent] {self.name} is working...")
        response = self.llm.generate(system_prompt, input_text)
        time.sleep(0.5) # Simulate processing time
        return response

class ResearchOpsPipeline:
    def __init__(self):
        self.llm = LLMService()
        self._init_agents()

    def _init_agents(self):
        # 1. Planner Agent
        self.planner = Agent(
            name="Step 1: Planner Agent",
            role="Planner Agent",
            goal="Analyze the VOC data to identify major problem categories or themes. Create a simple analysis plan.",
            output_format="Major complaints: [Category 1], [Category 2]. Plan: [Brief description of what to analyze for each].",
            llm=self.llm
        )

        # 2. Summarizer Agent
        self.summarizer = Agent(
            name="Step 2: Summarizer Agent",
            role="Summarizer Agent",
            goal="Categorize and summarize the VOC text based on the Planner's categories.",
            output_format="- [Category 1] Summary: [Key points]\n- [Category 2] Summary: [Key points]\n#Keywords",
            llm=self.llm
        )

        # 3. Insight Agent
        self.insight = Agent(
            name="Step 3: Insight Agent",
            role="Insight Agent",
            goal="Derive root causes and meaningful customer insights from the summary. Explain WHY these issues are happening.",
            output_format="Insight: [Deep dive into causes]\nHypothesis: [Proposed explanation or solution direction]",
            llm=self.llm
        )

        # 4. Report Agent
        self.reporter = Agent(
            name="Step 4: Report Agent",
            role="Report Agent",
            goal="Compile the insights into a final professional report in JSON format.",
            output_format='Markdown format with sections: "## Executive Summary", "## Key Issues", and "## Strategic Recommendation". Do not use JSON.',
            llm=self.llm
        )

        # 5. Evaluation Agent
        self.evaluator = Agent(
            name="Step 5: Evaluation Agent",
            role="Evaluation Agent",
            goal="Evaluate the quality of the generated report based on Coherence, Accuracy, Insightfulness, and Structure.",
            output_format='JSON format with keys: "score" (1-5), "rubric_breakdown" (object with scores for coherence, accuracy, insightfulness, structure), and "feedback" (string).',
            llm=self.llm
        )

    def execute(self, voc_text: str):
        print(f"Starting ResearchOps Pipeline for VOC:\n\"{voc_text}\"\n" + "="*50)
        
        results = {}

        # Step 1: Plan (Input: VOC)
        results['step1'] = self.planner.run(voc_text)
        print(f"\n=== STEP 1: PLANNER ===\n{results['step1']}")

        # Step 2: Summary (Input: Planner Output + Original VOC)
        # Summarizer needs the original text to summarize it according to the plan.
        summarizer_input = f"PLAN:\n{results['step1']}\n\nORIGINAL VOC DATA:\n{voc_text}"
        results['step2'] = self.summarizer.run(summarizer_input)
        print(f"\n=== STEP 2: SUMMARIZER ===\n{results['step2']}")

        # Step 3: Insight (Input: Summary)
        results['step3'] = self.insight.run(results['step2'])
        print(f"\n=== STEP 3: INSIGHT ===\n{results['step3']}")

        # Step 4: Report (Input: Insight)
        results['step4'] = self.reporter.run(results['step3'])
        print(f"\n=== STEP 4: REPORT ===\n{results['step4']}")

        # Step 5: Evaluation (Input: Report + Original VOC)
        # Evaluator needs original text to check accuracy.
        eval_input = f"Original VOC: {voc_text}\n\nGenerated Report: {results['step4']}"
        results['step5'] = self.evaluator.run(eval_input)
        print(f"\n=== STEP 5: EVALUATION ===\n{results['step5']}")

        return results

if __name__ == "__main__":
    # Example Input
    voc_input = """앱 결제가 자꾸 실패해서 너무 불편해요. 
고객센터도 답변이 너무 느리고 재구매는 고민됩니다.
UI는 괜찮지만 기능 안정성이 문제입니다."""

    pipeline = ResearchOpsPipeline()
    pipeline.execute(voc_input)
