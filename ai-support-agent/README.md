# Persona-Adaptive AI Customer Support Agent

An intelligent AI-powered customer support system that dynamically detects user persona, retrieves relevant knowledge, adapts response tone, and intelligently escalates high-risk conversations to human agents.

This project simulates a production-ready AI support pipeline suitable for SaaS platforms and marketing analytics tools.

---

## Problem Statement

Traditional support bots provide generic responses without understanding user intent, emotional state, or business urgency. This leads to poor user experience and inefficient escalation workflows.

This system solves that by building a:

> **Persona-Aware, Retrieval-Augmented, Escalation-Intelligent Support Agent**

---

## Core Features

###  Persona Detection

Classifies users into:

* Technical Expert
* Frustrated User
* Business Executive

Returns:

* Persona label
* Confidence score
* Reasoning

---

### Adaptive Tone Generation

Responses are dynamically adapted:

| Persona            | Tone Strategy                         |
| ------------------ | ------------------------------------- |
| Technical Expert   | Detailed, structured, technical       |
| Frustrated User    | Empathetic, calm, reassuring          |
| Business Executive | Concise, professional, impact-focused |

---

### Knowledge-Based Retrieval

* Uses a structured knowledge base
* Prevents hallucinations
* Implements a Retrieval-Augmented (RAG-style) approach
* Ensures consistent, grounded responses

---

### Intelligent Escalation Engine

Automatically escalates when:

* Strong frustration detected
* Refund/legal keywords appear
* Repeated failure occurs
* Persona confidence < threshold
* Issue cannot be resolved from knowledge base

Provides structured context handoff for human agents.

---

## System Architecture

User Input
↓
Persona Classification
↓
Knowledge Retrieval
↓
Tone Adaptation
↓
Response Generation
↓
Escalation Decision
↓
Structured JSON Output

---

## Tech Stack

* Python / TypeScript
* Google Gemini API (LLM)
* Structured Knowledge Base
* Modular AI System Design
* Logging for interaction tracking
* Optional UI (React / Streamlit)

---

## Evaluation Strategy

The system is tested across:

* Technical queries
* Emotional/frustrated scenarios
* Business-critical cases
* Escalation-triggering inputs
* Ambiguous/low-confidence prompts
* Multi-turn interactions

Persona classification accuracy and escalation logic are validated using structured test cases.

---

## Design Decisions

* LLM-based persona detection for flexibility
* JSON structured output for backend compatibility
* Modular architecture for scalability
* Escalation logic modeled after real SaaS workflows
* Knowledge grounding to reduce hallucinations

---

## Future Improvements

* Embedding-based semantic search (FAISS)
* Multi-language support
* Fine-tuned persona classifier
* Real-time CRM integration
* Support analytics dashboard

---

## Why This Project Matters

This project demonstrates:

* AI system design thinking
* Prompt engineering expertise
* Production-ready structured outputs
* Intelligent escalation workflows
* Backend integration awareness

It reflects how AI modules can be embedded into modern marketing analytics and SaaS support platforms.




## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
"# AI_Support_Agent" 


