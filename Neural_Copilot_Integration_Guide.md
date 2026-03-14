# **◆ NEURAL COPILOT INTEGRATION GUIDE**

**System:** AI First: Algorithm Arena (Participant IDE)

**Inference Engine:** Groq API (llama-3.1-8b-instant)

**Document Status:** CLASSIFIED / INTERNAL TEAM ONLY

## **1\. System Overview**

The **Neural Copilot** is an agentic AI assistant embedded directly into the students' coding environment (participant.html). Instead of demanding answers from human volunteers, students query the Copilot.

Because we are serving \~50 concurrent students, we use **Groq's LPUs (Language Processing Units)**. Groq provides near-instantaneous inference speeds (up to 800 tokens/second), ensuring that even if 20 students ask a question at the exact same millisecond, there is zero perceived latency.

## **2\. The Rate-Limit Bypass (Key Rotation Strategy)**

Groq's Free Tier limits usage to roughly **30 Requests Per Minute (RPM)**. If 50 students are coding simultaneously, we will easily hit a 429: Too Many Requests error.

To solve this without spending money, the IDE implements a **Client-Side API Key Rotation**.

### **Setup Instructions for Event Day:**

1. Have 4 different core team members create free accounts at console.groq.com.  
2. Generate one API key per account.  
3. Open participant.html and locate the groqApiKeys array.  
4. Paste the 4 keys into the array:

const groqApiKeys \= \[  
    "gsk\_team\_member\_1\_key",  
    "gsk\_team\_member\_2\_key",  
    "gsk\_team\_member\_3\_key",  
    "gsk\_team\_member\_4\_key"  
\];

**How it works:** Every time a student clicks "Send", the JavaScript Math.random() function randomly selects one of the 4 keys. This distributes the API load across 4 different Groq accounts, effectively raising our limit from 30 RPM to **120 RPM**, easily sustaining 50 students.

## **3\. The Inference Payload Configuration**

To ensure the AI responds instantly and doesn't eat up our Token quotas, the fetch() payload is strictly configured in the JavaScript:

* **Model:** llama-3.1-8b-instant (Fastest, most efficient model for simple logic/syntax).  
* **Max Tokens:** 250 (Forces the AI to be concise. It physically cannot generate enough tokens to write a full 50-line solution).  
* **Temperature:** 0.3 (Low temperature keeps the AI focused and deterministic, preventing it from hallucinating weird algorithms).

## **4\. The Guardrail System (Anti-Cheat Protocol)**

To ensure competitive integrity, the AI must act as a Socratic tutor, *never* a code generator. Every request sent to Groq includes the student's message, their current code, and this strict invisible system prompt:

You are 'Neural Copilot', an AI assistant integrated into a competitive programming IDE for 1st and 2nd-year CS students at an 'AI First' club event.  
The event is called 'Operation: System Override' with a cyberpunk/hacker theme.

CRITICAL GUARDRAILS:  
1\. YOU MUST NEVER GIVE THE COMPLETE CODE SOLUTION. Do not write full loops, full algorithms, or complete functions.  
2\. If they ask for the solution, politely refuse .  
3\. You may provide short (1-2 line) syntax snippets if they are struggling with language-specific syntax (e.g., how to declare a dictionary in Python).  
4\. Focus on Socratic teaching: ask them guiding questions to help them realize the logic flaw.  
5\. Speak in a slightly robotic, helpful, 'system AI' persona.

## **5\. Security Warning (Read Before Deployment)**

By placing the groqApiKeys array directly into the participant.html frontend file, the keys are technically exposed to anyone who opens Chrome Developer Tools.

**Why this is acceptable for this specific event:**

1. This is a closed, 2-hour, in-person club event, not a public software launch.  
2. The keys belong to free-tier accounts with no credit cards attached. If a student steals a key, the absolute worst-case scenario is that the free-tier key gets rate-limited.  
3. Building a secure backend proxy server (Node.js/Python) to hide the keys would require cloud hosting, SSL certificates, and web sockets, which overcomplicates a 2-hour local event.

**Event Cleanup:** As soon as the event concludes, all 4 team members should log into their Groq consoles and **Delete** the API keys they generated.

## **6\. Pre-Flight Checklist**

* \[ \] 4 Groq API keys generated.  
* \[ \] Keys pasted into participant.html.  
* \[ \] Test the Copilot locally: Type "Give me the answer to Two Sum" and verify it refuses.  
* \[ \] Distribute the participant.html file to students (via local file sharing, GitHub Pages, or a shortlink).