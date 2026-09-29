# SRINIVASH ENGLISH MASTERY OS
## Complete Private AI English Tutor, Fluency Lab & Executive Communication Coach

> This document is the authoritative master specification for the product. Every numbered
> section maps to a row in `docs/traceability.md`. Do not reduce scope without documenting the
> technical reason in that matrix.

---

# 0. YOUR ROLE

You are the principal product architect, senior full-stack engineer, AI engineer, speech/voice systems engineer, UX designer, QA engineer, language-learning systems designer, and technical lead responsible for building this application end-to-end.

Do not treat this as a prototype, landing page, demo, course website, or commercial SaaS.

Build a real, production-quality, private personal application for one learner:

**Learner: Srinivash**

The application exists for one purpose:

> Transform Srinivash into a highly capable English communicator across speaking, listening, grammar, pronunciation, vocabulary, reading, writing, business communication, negotiation, presentations, public speaking, casual English, modern English, formal English, executive English, and spontaneous conversation.

The application must act like a permanent private English professor, speaking coach, pronunciation trainer, conversation partner, business communication coach, negotiation simulator, writing instructor, and progress analyst.

The system must learn from Srinivash continuously.

---

# 1. NON-NEGOTIABLE PRODUCT PRINCIPLES

1. This application is PRIVATE.
2. It is intended only for Srinivash.
3. Do not build public signup.
4. Do not build subscriptions.
5. Do not build pricing.
6. Do not build marketplace functionality.
7. Do not build public profiles.
8. Do not build social feeds.
9. Do not build unnecessary multi-tenant SaaS infrastructure.
10. Do not intentionally withhold features for future versions.
11. The final application is ONE COMPLETE PRODUCT.
12. Internal modules may be developed sequentially, but the final user sees one unified system.
13. Voice-first learning is a core requirement, not an optional add-on.
14. The AI tutor must remember recurring mistakes and adapt training.
15. The system must never merely correct an error; it must teach the reason and create follow-up practice.
16. Learning must be practical and contextual, not textbook-only.
17. Tamil may be used strategically for explanations when it materially improves understanding.
18. The long-term objective is direct English thinking, not permanent Tamil-to-English translation.
19. Modern, casual, Gen-Z, professional, formal, academic and executive registers must all be covered.
20. Do not claim affiliation with Oxford, Harvard, Cambridge, IELTS, TOEFL or any university/testing institution.
21. The quality and rigor should be comparable to a highly capable advanced English coach.
22. Do not fabricate language scores or pronunciation precision when the underlying model cannot reliably measure them.
23. Every major score should expose sufficient evidence.
24. The user must be able to see improvement over weeks and months.
25. The interface must feel like a serious personal learning operating system, not a children's language game.

---

# 2. PRIMARY OUTCOME

The application should train the learner to progress toward advanced English communication comparable to CEFR C1/C2 capability.

The system must help the learner:

- think directly in English;
- speak without excessive translation delay;
- maintain conversations naturally;
- reduce grammatical errors;
- improve sentence structure;
- improve vocabulary retrieval;
- improve pronunciation and intelligibility;
- understand multiple English accents;
- understand fast natural speech;
- write accurately and professionally;
- communicate with international clients;
- explain technical and business ideas clearly;
- negotiate price and scope confidently;
- handle objections;
- lead meetings;
- present products and companies;
- debate and defend ideas;
- tell stories;
- speak spontaneously;
- communicate formally;
- communicate casually;
- understand current conversational English;
- understand idioms and phrasal verbs;
- manage tone and register appropriately;
- speak with clarity rather than memorised scripts.

---

# 3. USER MODEL

Create a persistent learner profile.

Minimum properties:

```text
name
native_language
current_level
target_level
learning_goals
preferred_learning_style
preferred_explanation_language
daily_available_minutes
business_context
technical_context
conversation_interests
weak_skills
strong_skills
recurring_errors
pronunciation_challenges
filler_words
active_vocabulary
passive_vocabulary
mastered_vocabulary
negotiation_weaknesses
presentation_weaknesses
writing_patterns
listening_weaknesses
current_curriculum_position
skill_mastery_map
```

Initial defaults:

```text
Learner: Srinivash
Native language: Tamil
Target: Advanced English mastery
Primary priorities:
- spoken fluency
- grammar
- pronunciation
- conversation
- business English
- sales communication
- negotiation
- executive communication
- presentation
- international client communication

Explanation style:
Practical, direct, example-heavy.

Tamil:
Allowed as a support language.
English should progressively become dominant.
```

Do not assume the current English level.

Measure it.

---

# 4. APPLICATION FORM

Build as:

**Responsive web application + installable PWA**

It must work well on:

- desktop;
- laptop;
- tablet;
- Android mobile browser;
- iPhone mobile browser.

Voice interaction must be excellent on mobile and desktop.

PWA requirements:

- installable;
- proper app manifest;
- icons;
- offline shell for non-AI static areas;
- graceful handling of connectivity loss;
- session recovery;
- update notification;
- microphone permission handling.

---

# 5. RECOMMENDED TECHNICAL ARCHITECTURE

Use a modern production stack.

Preferred architecture:

```text
Frontend:
Next.js
TypeScript
React
Tailwind CSS

UI:
Accessible component primitives
Reusable internal design system
Charts for learning analytics

Backend:
Next.js server layer OR a clean dedicated API service when technically justified

Database:
PostgreSQL

Managed DB/Auth option:
Supabase

Authentication:
Single-account allowlist
Google OAuth or secure magic-link authentication
Allowed account configured through environment variables
Never hard-code personal email in source

AI:
Provider abstraction layer

Speech-to-text:
Streaming-capable provider abstraction

Text-to-speech:
Low-latency provider abstraction

Realtime:
WebSocket or supported realtime transport

Storage:
Private object storage only when audio retention is enabled

Deployment:
Vercel-compatible web deployment
Managed PostgreSQL/Supabase
```

Do not lock core business logic directly into one AI vendor.

Create provider interfaces.

Example:

```text
LLMProvider
SpeechToTextProvider
TextToSpeechProvider
PronunciationAnalysisProvider
EmbeddingProvider
```

The application must still be maintainable if providers change.

Use the current stable official SDKs available at implementation time.

Never invent APIs.

Read official documentation before implementation.

---

# 6. SYSTEM ARCHITECTURE

Logical architecture:

```text
                         ┌─────────────────────────┐
                         │    Learner Interface    │
                         └────────────┬────────────┘
                                      │
                     ┌────────────────▼───────────────┐
                     │    Tutor Orchestration Layer   │
                     └────────────────┬───────────────┘
                                      │
       ┌──────────────────────────────┼─────────────────────────────┐
       │                              │                             │
┌──────▼──────┐             ┌────────▼────────┐          ┌────────▼────────┐
│Conversation │             │ Learning Engine │          │Evaluation Engine│
│   Engine    │             │                 │          │                 │
└──────┬──────┘             └────────┬────────┘          └────────┬────────┘
       │                              │                             │
       ├─ Grammar                     ├─ Skill Graph                 ├─ Fluency
       ├─ Vocabulary                  ├─ Curriculum                  ├─ Grammar
       ├─ Register                    ├─ Daily Planner               ├─ Pronunciation
       ├─ Context                     ├─ Spaced Repetition           ├─ Vocabulary
       └─ Roleplay                    └─ Remediation                 ├─ Listening
                                                                      ├─ Writing
                           ┌─────────────────────┐                    ├─ Business
                           │ Personal Memory     │                    └─ Negotiation
                           │ & Mistake Engine    │
                           └─────────────────────┘
```

---

# 7. MAIN NAVIGATION

Desktop left sidebar:

```text
Home
My Tutor
Speak
Pronunciation
Fluency
Listening
Grammar
Vocabulary
Reading
Writing
Business English
Negotiation
Presentation
Debate
Real-Life Simulator
Tongue Twisters
Daily Training
Mistake Vault
Journal
Progress
Assessments
Settings
```

Mobile:

Use bottom navigation for:

```text
Home
Tutor
Speak
Practice
Progress
```

Remaining modules go inside Practice.

---

# 8. PAGE: HOME

Route: `/`

Purpose: Show what Srinivash needs to do now.

Components:

### Header

```text
Good morning/afternoon/evening, Srinivash
Current English level
Current streak
Today's completion %
```

### Primary CTA

Button: **Start Today's Training**

### Quick Actions

- Talk to Tutor
- 5-Minute Fluency Drill
- Practice Pronunciation
- Start Negotiation
- Quick Grammar
- Review Mistakes

### Skill Radar

```text
Speaking
Grammar
Vocabulary
Pronunciation
Listening
Reading
Writing
Business English
Negotiation
Presentation
```

### Current Focus

Example:

```text
This week's focus:
Past tense consistency
Article usage
Client objection handling
Reduced filler words
TH pronunciation
```

### Recent Improvement

Example:

```text
Filler words ↓ 23%
Past tense accuracy ↑ 12%
Speaking duration without interruption ↑ 41 seconds
```

### Continue Learning — Resume latest unfinished exercise.
### Mistakes Due for Review — Show top recurring mistakes.
### Vocabulary Due — Show spaced-repetition count.
### Daily Challenge — One adaptive challenge.

---

# 9. PAGE: MY TUTOR

Route: `/tutor`

This is the main AI tutor.

Modes:

```text
Friendly Coach
Strict Grammar Professor
Conversation Partner
Pronunciation Coach
Business Coach
Negotiation Coach
Executive Coach
Debate Coach
Writing Coach
Native-Naturalness Coach
```

Controls:

- Start Voice Session
- Start Text Session
- Change Tutor Mode
- Correct Me Live toggle
- Correct Me After I Finish toggle
- Tamil Explanation toggle
- Difficulty selector
- End Session
- Review Session

AI behaviour: the tutor must know today's curriculum; learner profile; recent mistakes; recurring errors; vocabulary due; active goals; recent conversation context; current CEFR estimate; current speaking difficulty.

The tutor should reference past learning naturally. Example:

```text
Yesterday you repeatedly used "didn't went."
Today we'll check whether that pattern is fixed.
```

Do not overwhelm the learner by interrupting every minor speaking mistake unless Strict mode is selected.

---

# 10. PAGE: SPEAK

Route: `/speak`

Modes: Free Conversation; Topic Conversation; Rapid Response; 60-Second Speak; 2-Minute Speak; 5-Minute Speak; Storytelling; Explain It; Picture Description; Opinion Mode; English-Only Mode.

Buttons: Start Recording; Pause; Resume; Finish Answer; Replay My Audio; See Transcript; Analyse; Try Again; Show Better Version; Add Mistake to Practice; Next Challenge.

After each substantial answer show:

```text
Transcript
Corrected English
Natural English
Professional version where relevant
Key grammar issues
Vocabulary opportunities
Filler words
Fluency feedback
Pronunciation notes
One primary improvement action
```

Never convert every response into an exhausting page of criticism. Prioritise the highest-value issues.

---

# 11. PAGE: PRONUNCIATION

Route: `/pronunciation`

Sections: Sound Lab; Minimal Pairs; Word Practice; Sentence Practice; Connected Speech; Stress; Rhythm; Intonation; IPA; Difficult Words; Saved Pronunciation Errors.

Cover difficult sound contrasts relevant to Tamil speakers, including when applicable:

```text
θ / ð
v / w
f / p
z / s
ʒ / ʃ
r / l
æ / ɑ / ʌ
word-final consonants
consonant clusters
```

A pronunciation exercise should support: Listen; Record; Replay; Compare; View waveform if technically useful; View target stress; View IPA; View articulation guidance; Retry; Mark mastered.

Do not teach an artificial accent. Primary objectives: intelligibility; clarity; stress; rhythm; natural connected speech. Accent imitation is optional.

---

# 12. IPA MODULE

Teach IPA progressively. Do not dump the whole IPA chart on day one.

Cover: vowels; consonants; voiced vs unvoiced; diphthongs; stress marks; schwa; connected speech.

Every relevant pronunciation item can display:

```text
Word
IPA
Syllables
Stress
Audio
Mouth/tongue hint
Example sentence
```

---

# 13. PAGE: TONGUE TWISTERS

Route: `/tongue-twisters`

Categories: R/L; V/W; TH; S/SH; F/P; T/D; Consonant clusters; Breath control; Articulation; Speed; Mixed advanced.

Difficulty: 1 Beginner; 2 Easy; 3 Intermediate; 4 Advanced; 5 Extreme.

Training sequence: Listen → Slow practice → Medium practice → Normal speed → Fast attempt → Accuracy challenge.

Measure: completion; skipped words; approximate accuracy; articulation; speed; repeated errors; problematic sounds.

Buttons: Hear It; Slow Audio; Start; Stop; Replay; Retry; Increase Speed; Next; Save for Practice.

---

# 14. PAGE: FLUENCY

Route: `/fluency`

Train: response latency; continuity; filler reduction; pauses; self-correction; sentence completion; idea organisation; speaking speed; spontaneous retrieval.

Exercises:

```text
30-second nonstop speaking
60-second nonstop speaking
Random question
No-filler challenge
No-translation challenge
Finish the thought
Speak from keywords
Paraphrase instantly
Explain in simple English
Speed response
```

Track common fillers: actually, basically, like, you know, I mean, so, okay, right, hmm, uh, um.

Do not treat natural discourse markers as automatically wrong. Analyse frequency and context.

---

# 15. PAGE: LISTENING

Route: `/listening`

Modes: Sentence comprehension; Conversation; Phone call; Meeting; Interview; Podcast-style; Client call; Fast speech; Connected speech; Accent exposure; Dictation.

Accent exposure may include: Indian English; General American; Modern British; Australian; International business English; other well-supported accents. Do not caricature accents.

Exercises: listen once; answer question; listen again; transcript reveal; identify missed words; dictation; summary; shadowing.

Speed controls: 0.75x; 1x; 1.15x; 1.3x.

---

# 16. SHADOWING SYSTEM

Available within Listening and Pronunciation.

Workflow: Hear model sentence → Wait short delay → Learner repeats → Record learner → Compare timing → Compare stress → Compare rhythm → Highlight issues → Retry.

Support: short sentence; business sentence; paragraph; presentation lines.

---

# 17. PAGE: GRAMMAR

Route: `/grammar`

Curriculum must cover at least:

```text
Parts of speech, Nouns, Pronouns, Articles, Determiners, Adjectives, Adverbs, Prepositions,
Conjunctions, Auxiliary verbs, Modal verbs, Verb forms, All major tense/aspect structures,
Questions, Negation, Subject-verb agreement, Countable/uncountable nouns, Comparatives,
Superlatives, Conditionals, Passive voice, Reported speech, Relative clauses, Gerunds,
Infinitives, Participles, Phrasal structures, Clauses, Compound sentences, Complex sentences,
Parallel structure, Emphasis, Inversion, Subjunctive constructions, Advanced punctuation,
Style, Register-sensitive grammar
```

Every lesson follows: Concept → Why it matters → Rule → Simple examples → Natural examples → Business examples → Common Indian-English mistakes if relevant → Speaking exercise → Writing exercise → Mini quiz → Real-world use → Review schedule.

Grammar lessons must dynamically prioritise mistakes actually made by the learner.

---

# 18. PAGE: VOCABULARY

Route: `/vocabulary`

Sections: My Words; Due Today; Business; Technology; Sales; Negotiation; Leadership; Daily Life; Emotions; Travel; Academic; Advanced; Idioms; Phrasal Verbs; Collocations; Modern English.

Each vocabulary object supports:

```text
word, pronunciation, IPA, part of speech, meaning, Tamil explanation when requested,
simple example, natural example, business example, synonyms, antonyms, collocations,
word family, register, common mistakes, learner-created sentence, mastery, next review
```

Spaced repetition required. Do not reward recognition alone. A word becomes mastered only after successful recall and contextual usage across multiple dates.

---

# 19. PHRASAL VERB SYSTEM

Cover high-value examples such as: follow up; bring up; look into; carry out; set up; turn down; figure out; work out; take over; follow through; point out; come up with; deal with.

Teach meaning by context.

---

# 20. IDIOM SYSTEM

Teach useful idioms with register guidance. For every idiom specify: Meaning; Natural context; Formal suitability; Casual suitability; Business suitability; Example; Misuse warning.

Avoid forcing idioms unnaturally.

---

# 21. COLLOCATION SYSTEM

Teach combinations such as: make a decision; reach an agreement; strong argument; meet a deadline; raise a concern; address an issue; deliver results; negotiate terms.

Detect awkward combinations in writing and speech.

---

# 22. MODERN / GEN-Z ENGLISH

Create a clearly labelled Modern English module. Include current conversational expressions only when still in real use.

For each expression: Meaning; Register; Age/context; Casual suitability; Professional suitability; Potentially dated? yes/no; Example; Safer neutral alternative.

Examples may include: low-key, high-key, my bad, fair enough, I'm down, makes sense, that's wild, legit, kinda, gonna, wanna, gotta, not gonna lie.

Never imply slang is automatically advanced English. The learner must know when not to use it.

---

# 23. REGISTER SWITCHING

Teach at least: Very casual; Casual; Neutral; Professional; Formal; Executive; Academic; Diplomatic; Assertive; Persuasive.

Example transformation task — input meaning "Give me a moment." → learner register-switches into Casual / Professional / Formal / Executive.

Register control is a major mastery skill.

---

# 24. PAGE: READING

Route: `/reading`

Materials: conversations; business writing; news-style passages; technology; essays; fiction; reports; research-style text; product documentation; contracts; proposals.

Exercises: comprehension; vocabulary; summarisation; identify argument; infer meaning; identify tone; paraphrase; explain orally; rewrite simply; critique reasoning.

Difficulty must adapt.

---

# 25. PAGE: WRITING

Route: `/writing`

Modes: Free writing; WhatsApp; Professional chat; Email; Formal email; Proposal; Report; Executive summary; Technical explanation; Client response; Complaint; Negotiation email; Follow-up; LinkedIn-style post; Story; Essay; Presentation script.

Workflow: Prompt → Learner writes → Analyse → Show original → Highlight issues → Explain issues → Corrected version → Natural version → Advanced version → Ask learner to rewrite → Re-evaluate.

Score: Grammar; Clarity; Structure; Vocabulary; Tone; Naturalness; Conciseness; Register; Coherence.

Do not replace the learner's writing every time without requiring them to practise the correction.

---

# 26. PAGE: BUSINESS ENGLISH

Route: `/business`

Modules: Introducing yourself; Introducing a company; Discovery call; Requirement gathering; Product demo; Proposal; Pricing; Scope discussion; Timeline; Project update; Delay communication; Client complaint; Client escalation; Team meeting; Leadership communication; Hiring; Partnership; Networking; Conference conversation; International client communication; Closing a sale; Follow-up.

Scenarios should support voice roleplay.

---

# 27. PAGE: NEGOTIATION

Route: `/negotiation`

Train: Anchoring; Value framing; Clarifying; Counteroffers; Concessions; Scope control; Price defence; Payment terms; Deadline negotiation; Expectation management; Silence; Trade-offs; Boundary setting; Objection handling; Closing.

AI personas: Friendly buyer; Budget buyer; Aggressive buyer; Experienced procurement manager; Technical founder; Sceptical CEO; Impatient customer; Foreign client; Existing customer requesting discount; Client threatening competitor switch.

Difficulty levels: Easy; Realistic; Hard; Expert; Pressure Test.

Example AI opener:

```text
Your quote is ₹50,000.
Another company quoted ₹25,000.
Why should I pay you twice as much?
```

AI must dynamically respond to the learner. It must not simply follow a fixed script.

After session evaluate: English accuracy; Clarity; Confidence; Question quality; Value framing; Objection handling; Concession discipline; Persuasiveness; Professional tone; Closing.

Also provide: What you said; Why it worked/didn't; Better response; Alternative response; One challenge to retry.

---

# 28. PAGE: PRESENTATION

Route: `/presentation`

Modes: Self introduction; Company introduction; Product pitch; Sales presentation; Technical presentation; Investor-style pitch; Team briefing; Conference talk; Impromptu presentation.

Timer options: 1 min; 2 min; 3 min; 5 min; 10 min; Custom.

Score: Opening; Structure; Transitions; Clarity; Fluency; Grammar; Vocabulary; Voice modulation; Pace; Confidence proxy; Persuasiveness; Closing.

Do not claim to measure psychological confidence. Measure observable speech behaviours associated with delivery.

---

# 29. PUBLIC SPEAKING TRAINING

Teach: Breath control; Pausing; Emphasis; Pacing; Voice modulation; Storytelling; Hooks; Transitions; Analogies; Rhetorical questions; Audience framing; Memorable endings; Handling interruptions; Handling questions.

---

# 30. PAGE: DEBATE

Route: `/debate`

AI presents a position. Learner responds. AI challenges reasoning.

Modes: Friendly; Academic; Fast; Aggressive but professional; Cross-examination.

Skills: Claim; Evidence; Reasoning; Counterargument; Rebuttal; Clarification; Concession; Summary.

After debate provide language feedback separately from reasoning feedback. Do not conflate English proficiency with correctness of the learner's opinion.

---

# 31. PAGE: REAL-LIFE SIMULATOR

Route: `/simulator`

Scenarios: Airport; Immigration; Hotel; Restaurant; Taxi; Shopping; Hospital reception; Bank; Customer support; Job interview; Networking event; Conference; Office; Team meeting; Foreign client; Phone call; Technical support; Emergency communication; Social conversation; Meeting new people.

AI acts as the other person. Never reveal the entire conversation script before the roleplay.

---

# 32. TAMIL → ENGLISH LAB

Module inside Practice. Tamil sentence or idea appears. Learner produces English. System shows: Literal/basic; Natural; Professional; Formal if applicable. Explain differences. Over time reduce reliance on this module.

---

# 33. THINK IN ENGLISH LAB

Separate from translation training. Exercises: describe image; describe surroundings; explain what you are doing; speak from keywords; internal monologue; rapid naming; spontaneous explanation; storytelling from sequence. English-only rules can be enforced.

---

# 34. CONVERSATION RECOVERY TRAINING

Explicitly teach how to continue when a word is forgotten. Strategies:

```text
What I mean is...
Let me put that differently...
I'm looking for the word...
It's something that...
In other words...
Let me rephrase that.
```

Train recovery instead of freezing.

---

# 35. PRECISION ENGLISH

Train replacement of vague vocabulary (good, bad, thing, do, make, very, nice, problem) with context-specific vocabulary. Never encourage unnecessarily complicated words. Precision > sophistication for its own sake.

---

# 36. JOURNAL

Route: `/journal`

Daily journal supports: text; voice; optional prompt.

AI analyses: Grammar; Vocabulary; Expression; Naturalness; Recurring errors; New words worth learning.

Buttons: New Entry; Voice Entry; Save; Analyse; Improve; Practise Mistakes; View History.

---

# 37. DAILY TRAINING ENGINE

Route: `/daily`

Default full session: **45 minutes**. Suggested adaptive allocation:

```text
10 min conversation
5 min grammar remediation
5 min vocabulary
5 min pronunciation
5 min listening
10 min business/negotiation/presentation
5 min review
```

Do not rigidly force this distribution. Adapt from learner data.

Quick modes: 5 / 15 / 30 / 45 minutes / Custom.

Daily plan generation factors: weakness severity; recent mistakes; spaced repetition due items; skill neglect; goal importance; previous-day performance; learner fatigue signals; time available; curriculum prerequisites.

---

# 38. CURRICULUM ENGINE

Do not represent the curriculum as a simple linear list. Build a skill graph.

Each skill has: id; domain; name; description; difficulty; prerequisites; importance; CEFR relevance; exercise types; mastery threshold.

Learner skill state: mastery_score; confidence; attempt_count; correct_count; last_practised_at; next_review_at; status; evidence_count.

Status: unseen; learning; practising; stable; mastered; relapsed.

---

# 39. ADAPTIVE PLANNING ALGORITHM

For each potential learning item calculate priority using: weakness; importance; review urgency; recurrence; goal relevance; skill neglect; prerequisite readiness.

```text
priority =
weakness_weight
× importance
× recurrence_factor
× review_due_factor
× goal_relevance
× neglect_factor
```

Do not let one domain monopolise all learning time. Use domain balancing.

---

# 40. SPACED REPETITION

Initial review schedule: same session; 1 day; 3 days; 7 days; 14 days; 30 days; 60 days. Intervals adapt from success. Vocabulary and recurring mistakes both use spaced review. Recognition is insufficient for mastery. Require recall/use.

---

# 41. MISTAKE MEMORY ENGINE

Each mistake creates or updates a canonical pattern. Example:

```text
Observed: I didn't went there.
Canonical error: did + past-tense verb
Category: Grammar > Past tense > Auxiliary did
Correct pattern: did + base verb
```

Store: error_signature; domain; subcategory; original_example; corrected_example; explanation; severity; first_seen_at; last_seen_at; occurrence_count; contexts_seen; successful_corrections; review_streak; status; next_review_at.

Statuses: new; recurring; improving; monitoring; mastered; relapsed.

Do not mark a mistake mastered after one correct answer. Require correct use across multiple contexts and separated dates. If the same mistake reappears after mastery: status = relapsed; return it to training.

---

# 42. FOSSILISED ERROR DETECTION

Watch for repeated patterns common in Indian English: discuss about; revert back; one of my friend; today morning; I have a doubt; I am having...; itself; only; do one thing.

Do not blindly mark regional English as wrong. Explain: standard international usage; Indian English usage where relevant; professional alternative.

---

# 43. TUTOR MEMORY

Separate: Short-term memory (current session); Episodic memory (important prior sessions); Learner memory (persistent long-term language patterns); Mistake memory; Vocabulary memory; Curriculum memory.

Avoid storing irrelevant conversation details. Memory retrieval must prioritise language-learning relevance.

---

# 44. VOICE ARCHITECTURE

Pipeline: Microphone → Browser audio capture → Voice activity detection → Streaming audio transport → Speech-to-text → Turn segmentation → Tutor orchestrator → AI response → Text-to-speech → Playback.

Parallel analysis pipeline: Learner audio → Transcript → Grammar / Fluency / Vocabulary / Pronunciation / Filler / Register analysis / Mistake detection → Session evaluation.

Requirements: low latency; interruption support where provider permits; microphone permission recovery; device selection when available; graceful network recovery; no duplicate transcription; partial transcript handling; clear recording state; accessible stop button.

---

# 45. AUDIO PRIVACY

Default: do not permanently store raw audio unless required by the learner.

Setting — Audio retention: Off; 7 days; 30 days; Keep manually selected recordings.

Transcripts and derived learning metrics may be retained. If audio storage is enabled: private storage; authenticated access; signed URLs; no public buckets.

---

# 46. AI TUTOR ORCHESTRATOR

Inputs: learner profile; session goal; tutor mode; recent session context; relevant mistake memories; relevant vocabulary; current skill mastery; current curriculum objective; user settings.

Output controls: response; corrections; follow-up question; difficulty; exercise generation; memory update candidates; evaluation requests.

The tutor should not retrieve the entire database every turn. Use targeted retrieval.

---

# 47. CORE TUTOR SYSTEM BEHAVIOUR

```text
You are Srinivash's private advanced English tutor.
Your purpose is to improve his real English ability rather than merely provide answers.
Be conversational.
When he speaks, understand his intended meaning before correcting.
Do not interrupt every minor mistake unless strict correction mode is enabled.
Prioritise errors that:
1. change meaning,
2. recur frequently,
3. sound unnatural in the target context,
4. affect professional communication,
5. block fluency.
When correcting:
- quote the relevant error,
- provide the correction,
- explain why,
- provide one or two contextual examples,
- make Srinivash use the pattern again.
Distinguish: grammatically wrong; grammatically possible but unnatural; regional English;
casual English; professional English; formal English.
Do not force formal English into casual conversations.
Do not force slang into professional conversations.
Encourage direct English thinking.
Use Tamil only when it materially improves understanding or when requested.
As proficiency rises, reduce Tamil automatically.
Always adapt difficulty from evidence.
Never invent a proficiency improvement score.
Base feedback on stored attempts and measurable behaviour.
```

---

# 48. CORRECTION MODES

Conversation First (important errors after the response); Balanced (major + recurring); Strict (almost every relevant error); Fluency (minimise interruption); Native Naturalness (idiom, register, collocation, phrasing); Grammar Intensive.

---

# 49. SPEAKING ANALYSIS

Measure observable metrics: total speaking time; word count; approximate words/minute; pause count; pause duration; long pauses; filler frequency; repeated words; self-corrections; sentence completion; grammar errors; vocabulary diversity; response latency.

Do not reward speed alone. Fast but incoherent English is not fluent English.

---

# 50. FLUENCY SCORE

0–100. Weighted model:

```text
Continuity                20%
Pause efficiency          20%
Idea completion           15%
Filler control            15%
Appropriate speaking rate 10%
Response latency          10%
Repair/recovery ability   10%
```

Calibrate using real usage. Store component scores. Never display unexplained black-box numbers.

---

# 51. GRAMMAR SCORE

Do not merely use mistakes/words. Use severity weighting:

```text
Meaning-breaking error      3
Major structural error      2
Minor grammar error         1
Style/naturalness note      not grammar error
```

Consider sentence complexity. A learner attempting complex sentences should not be unfairly punished compared with someone speaking only simple sentences.

---

# 52. PRONUNCIATION SCORE

```text
Intelligibility         30%
Target sound accuracy   25%
Word stress             15%
Rhythm                   10%
Sentence stress          10%
Connected speech          5%
Consistency               5%
```

Only calculate dimensions supported by reliable technical evidence. If phoneme-level evidence is unavailable, do not fabricate phoneme scores. Expose confidence level.

---

# 53. VOCABULARY SCORE

Consider: range; appropriateness; retrieval; collocation; repetition; precision; register; active usage. Do not reward rare vocabulary merely because it is rare.

---

# 54. WRITING SCORE

```text
Grammar          20%
Clarity          15%
Coherence        15%
Structure        10%
Vocabulary       10%
Naturalness      10%
Tone/Register    10%
Conciseness       5%
Mechanics         5%
```

Weights may vary by task.

---

# 55. NEGOTIATION SCORE

Keep language and negotiation skill partly separate.

Language: Grammar; Clarity; Tone; Vocabulary; Fluency.
Negotiation: Question quality; Value framing; Objection handling; Concession discipline; Boundary clarity; Alternative generation; Closing.

Never suggest that grammatically perfect English equals good negotiation.

---

# 56. PRESENTATION SCORE

Components: Opening; Structure; Logical flow; Transitions; Clarity; Language; Pacing; Pauses; Emphasis; Audience framing; Conclusion.

---

# 57. CEFR ESTIMATION

Support A1–C2. Do not derive CEFR from one overall raw number alone. Use evidence across Speaking; Listening; Reading; Writing; Grammar/use; Vocabulary.

A higher overall score must not assign C1/C2 if a critical language domain remains substantially below the required level.

Display: Estimated level; Evidence; Confidence; Skill-level breakdown. Label it clearly as an application estimate.

---

# 58. INITIAL ASSESSMENT

Route: `/assessment/initial`

Roughly 45–90 minutes, allow breaks. Sections: Grammar; Vocabulary; Reading; Listening; Writing; Pronunciation; Speaking; Conversation; Storytelling; Business communication; Negotiation; Spontaneous response.

Allow Save & Continue Later / Resume Assessment. Do not reveal answers before completion.

At finish generate: Overall estimated CEFR; Domain scores; Strengths; Weaknesses; Recurring patterns; Pronunciation focus; Fluency profile; Vocabulary profile; Business communication profile; Recommended starting curriculum.

---

# 59. MONTHLY ASSESSMENT

Route: `/assessments`

Comparable but not identical tasks. Track progress longitudinally. Prevent memorisation bias.

---

# 60. PROGRESS PAGE

Route: `/progress`

Views: 7 days; 30 days; 90 days; 6 months; All time.

Charts: speaking time; fluency; grammar; vocabulary; pronunciation; listening; writing; active vocabulary; recurring mistakes; mastered mistakes; fillers; learning streak; skill mastery; CEFR estimate history.

Show evidence behind score changes (e.g. past-tense errors per week). This is more valuable than decorative gamification.

---

# 61. WEEKLY REPORT

Contains: Time practised; Speaking minutes; Skills practised; New vocabulary; Mastered vocabulary; Recurring mistakes; Resolved mistakes; Most improved area; Weakest area; Recommended next focus; Best speaking sample; One challenge for next week.

---

# 62. MONTHLY REPORT

Includes: CEFR estimate change; Skill-score change; Mistake trend; Fluency trend; Vocabulary trend; Pronunciation trend; Listening trend; Business communication trend; Negotiation trend; Presentation trend; Recommended monthly objective.

---

# 63. DATABASE SCHEMA

Implement migrations. Core tables:

```text
users, learner_profiles, learner_preferences, learning_goals,
skill_definitions, skill_prerequisites, learner_skill_states,
assessments, assessment_sections, assessment_items, assessment_attempts, assessment_responses,
learning_sessions, session_turns, speech_segments, speech_metrics,
pronunciation_attempts, pronunciation_metrics,
grammar_errors, mistake_patterns, mistake_occurrences, mistake_reviews,
vocabulary_items, learner_vocabulary, vocabulary_reviews, collocations, idioms, phrasal_verbs,
curriculum_plans, daily_plans, daily_plan_items,
exercise_definitions, exercise_attempts,
roleplay_scenarios, roleplay_sessions, roleplay_turns,
writing_submissions, reading_attempts, listening_attempts,
journal_entries,
tutor_memories, memory_embeddings_if_needed,
weekly_reports, monthly_reports,
prompt_templates, prompt_versions,
ai_evaluation_events,
user_settings
```

Use UUIDs. Include created_at / updated_at where appropriate. Use foreign keys and indexes.

---

# 64. IMPORTANT DATABASE DETAILS

learner_skill_states: id, learner_id, skill_id, mastery_score, confidence_score, attempt_count, success_count, last_practised_at, next_review_at, status.

mistake_patterns: id, learner_id, error_signature, domain, subcategory, explanation, recommended_pattern, severity, first_seen_at, last_seen_at, occurrence_count, successful_review_count, review_streak, next_review_at, status.

mistake_occurrences: id, mistake_pattern_id, session_id, turn_id, original_text, corrected_text, context, detected_at.

learner_vocabulary: id, learner_id, vocabulary_item_id, status, recognition_score, recall_score, usage_score, last_reviewed_at, next_review_at, successful_context_uses.

learning_sessions: id, learner_id, session_type, tutor_mode, started_at, ended_at, duration_seconds, overall_summary.

speech_metrics: session_id, turn_id, duration, word_count, words_per_minute, response_latency, pause_count, average_pause, long_pause_count, filler_count, repetition_count, self_correction_count.

---

# 65. API/SERVICE BOUNDARIES

Services: TutorService; ConversationService; AssessmentService; CurriculumService; MistakeService; VocabularyService; SpeechService; PronunciationService; EvaluationService; RoleplayService; ProgressService; ReportService; MemoryService.

Avoid giant route handlers containing all logic.

---

# 66. AI STRUCTURED OUTPUT

All evaluator prompts return validated structured JSON. Use schemas. Validate AI responses before database writes. Never trust free-form model output to mutate state directly.

---

# 67. AI EVALUATION SAFEGUARDS

For critical scoring: store evaluator version; prompt version; model/provider; preserve input evidence; preserve confidence; make re-evaluation possible. Do not overwrite historical scores silently after scoring algorithm changes.

---

# 68. DESIGN SYSTEM

Visual direction: Premium; Calm; Professional; Modern; Focused; Minimal; High-information without clutter.

Avoid: cartoon mascots; childish visuals; excessive confetti; neon overload; gimmicky gamification; endless badges.

Layout: Left navigation; Central workspace; Optional right-side Tutor Insight panel.

Use: clean typography; generous spacing; subtle cards; strong hierarchy; readable transcripts; clear recording state; responsive charts.

Support dark, light and system mode.

---

# 69. ACCESSIBILITY

WCAG-oriented: keyboard support; visible focus; ARIA labels; sufficient contrast; screen-reader-friendly forms; captions/transcripts for audio; no colour-only status indicators; reduced-motion support.

---

# 70. SETTINGS

Route: `/settings`

Tutor: Default tutor mode; Correction mode; Explanation language; Preferred English register; Difficulty.
Voice: Tutor voice; Playback speed; Microphone; Audio retention.
Learning: Daily target minutes; Primary goals; Training days; Quick mode duration.
Privacy: Delete audio; Delete transcripts; Export learning data; Reset learning progress.

Require confirmation for destructive operations.

---

# 71. PERSONAL DATA EXPORT

Export: Learner profile; Progress; Mistakes; Vocabulary; Session summaries; Journal; Assessment results. Formats: JSON; CSV where meaningful.

---

# 72. SECURITY

Authentication mandatory; deny public account creation; server-side allowlist; route protection; database row security where relevant; private storage; no secrets in client bundle; CSRF protections; secure cookies; rate limits for expensive AI endpoints; input validation; output validation; safe markdown rendering; dependency scanning; security headers. Never rely only on hidden URLs.

---

# 73. OBSERVABILITY

Structured server logs; AI call errors; speech-provider errors; latency metrics; failed evaluation tracking; database failure logging; frontend error boundaries. Do not log sensitive raw audio.

---

# 74. COST CONTROLS

Prompt caching; targeted context; summarisation; small evaluator model where sufficient; frontier model for complex tutoring; avoid sending entire history every turn; stream responses; cache static curriculum assets. Daily/monthly AI usage dashboard if practical.

---

# 75. FAILURE BEHAVIOUR

If AI analysis fails: do not lose recording/transcript; show "Analysis temporarily failed. Retry analysis." If TTS fails: display text. If STT fails: allow manual transcript input. If network drops: preserve the current exercise locally when possible.

---

# 76. REPOSITORY STRUCTURE

```text
src/
  app/
  components/{ui,tutor,voice,charts,exercises}/
  features/{assessment,conversation,curriculum,fluency,grammar,journal,listening,mistakes,
            negotiation,presentation,pronunciation,reading,simulator,vocabulary,writing}/
  lib/{ai,audio,auth,db,evaluation,memory,scoring,security}/
  server/
  types/
  hooks/
  stores/
supabase/ (or drizzle/) migrations + seed
tests/{unit,integration,e2e,fixtures}/
docs/
```

Adapt if the chosen framework requires another structure.

---

# 77. SEED CONTENT

Seed: grammar hierarchy; pronunciation sounds; tongue twisters; business scenarios; negotiation scenarios; daily-life scenarios; presentation topics; debate topics; phrasal verbs; idioms; collocations; high-value vocabulary groups; listening task templates; writing task templates.

AI can generate endless variation later. Core taxonomy must be curated and deterministic.

---

# 78. REQUIRED WORKFLOWS

A — First Use: Authenticate → Welcome → Configure goals → Microphone test → Initial assessment → Generate profile → Generate curriculum → Dashboard → First training.
B — Daily Session: Home → Start Today's Training → Warm-up → Conversation → Adaptive exercise → Mistake review → Vocabulary review → Pronunciation/listening → Business scenario → Summary → Update mastery → Schedule reviews.
C — Free Conversation: Speak → Record → AI conversation → End → Analyse → Extract mistakes → Update memory → Create drills.
D — Mistake Remediation: Detected → Canonical pattern → Occurrence stored → Explanation → Immediate exercise → Delayed review → Re-test in different context → Mastery/relapse update.
E — Negotiation: Scenario → Difficulty → Voice conversation → Dynamic objections → Close → Language eval → Negotiation eval → Replay critical moments → Retry weak responses.
F — Pronunciation: Target → Hear → Record → Analyse → Specific issue → Articulation guidance → Retry → Sentence use → Conversation use.

---

# 79. SESSION SUMMARY

Every substantial session ends with: What you did; What improved; Top 3 mistakes; Best sentence; One upgraded expression; Vocabulary learned; Practice scheduled; Next recommended activity.

---

# 80. GAMIFICATION

Light motivation only: Practice streak; Minutes; Skill completion; Personal best; Mastery count; Weekly goal. No coins/currency. No leaderboards.

---

# 81. REQUIRED TEST STRATEGY

Unit; Integration; Database; AI-schema; Voice-state; E2E browser; Responsive; Accessibility; Security; Regression.

---

# 82. CRITICAL UNIT TESTS

skill priority calculation; spaced repetition scheduling; mistake canonicalisation; mistake recurrence increment; mistake mastery; mistake relapse; vocabulary review scheduling; fluency score; grammar severity; writing score; CEFR gate rules; daily-plan balancing; account allowlisting; AI schema validation.

---

# 83. CRITICAL INTEGRATION TESTS

conversation → transcript; transcript → evaluation; evaluation → mistake storage; mistake → daily review; vocabulary → review schedule; assessment → skill state; skill state → curriculum plan; voice session → summary; negotiation → separate language/negotiation scoring; report → historical data.

---

# 84. END-TO-END TESTS

E2E-01 Authentication · E2E-02 First onboarding · E2E-03 Assessment resume · E2E-04 Assessment completion · E2E-05 Daily training · E2E-06 Quick training · E2E-07 Voice conversation · E2E-08 Microphone denial · E2E-09 Network interruption · E2E-10 Mistake detection · E2E-11 Mistake recurrence · E2E-12 Mistake mastery · E2E-13 Mistake relapse · E2E-14 Vocabulary · E2E-15 Pronunciation · E2E-16 Tongue twister · E2E-17 Listening · E2E-18 Writing · E2E-19 Business simulation · E2E-20 Negotiation · E2E-21 Presentation · E2E-22 Debate · E2E-23 Journal · E2E-24 Progress · E2E-25 Weekly report · E2E-26 Data export · E2E-27 Audio deletion · E2E-28 Mobile layout · E2E-29 PWA · E2E-30 Accessibility.

---

# 85. AI QUALITY TESTS

Deterministic fixture transcripts testing: didn't went; discuss about; one of my friend; today morning; article omission; preposition misuse; awkward collocation; formal/casual mismatch; filler-heavy speech; grammatically correct but unnatural English; strong grammar but weak negotiation; regional Indian English. Expected evaluator behaviour asserted.

---

# 86. NO FAKE DEMO DATA IN PRODUCTION

Initial empty history must look intentionally empty. No fabricated improvement charts. Seed curriculum content allowed; fake personal progress not.

---

# 87. QUALITY GATES

lint; typecheck; unit; integration; E2E; production build; migrations; no critical a11y failures; no known critical security vulnerabilities; mobile QA; desktop QA; voice smoke tests.

---

# 88. BROWSER QA

Manually inspect every major route at desktop, tablet, mobile. Check clipping; overflow; sticky elements; modals; keyboard; recording controls; transcript readability; charts; dark/light mode.

---

# 89. PERFORMANCE

Lazy-load heavy modules; avoid loading entire history; paginate; virtualise where appropriate; optimise audio; stream AI responses; skeletons; prevent UI blocking during analysis.

---

# 90. IMPLEMENTATION ORDER

1 Repository + architecture · 2 Auth · 3 Database · 4 Learner profile · 5 AI provider abstraction · 6 Tutor orchestrator · 7 Voice foundation · 8 Assessment · 9 Skill/curriculum · 10 Mistake memory · 11 Daily training · 12 Speaking + fluency · 13 Grammar + vocabulary · 14 Pronunciation + IPA + tongue twisters · 15 Listening + shadowing · 16 Reading + writing · 17 Business · 18 Negotiation · 19 Presentation · 20 Debate · 21 Simulator · 22 Journal · 23 Progress/reporting · 24 PWA · 25 Privacy/export · 26 Full QA · 27 Security review · 28 Performance review · 29 Final visual polish · 30 Production readiness.

Do not stop after an early subset and call the product complete.

---

# 91. AGENT WORKING RULES

Before coding: inspect repository; read existing instructions; produce implementation plan; identify architectural risks; verify external APIs using official documentation; do not invent SDK methods; create database architecture before scattering mock state.

While coding: logically scoped commits; reuse components; avoid giant files; strict TypeScript; tests alongside features; never suppress type errors casually; no core flows as TODOs; no placeholders for required features; no fake AI analysis; no fake voice evaluation; do not remove requirements to make tests pass.

---

# 92. FAILURE MODES TO AVOID

A pretty dashboard with no learning engine; static mock lessons; fake progress; ChatGPT clone with no memory; grammar checker marketed as tutor; voice recorder without analysis; fixed roleplay script; generic course ignoring personal mistakes; pronunciation score based only on STT confidence; public SaaS auth; childish Duolingo clone; marketing website.

---

# 93. DEFINITION OF DONE

Complete only when Srinivash can: log in privately; complete a comprehensive assessment; receive an evidence-based profile; speak by voice with the tutor; receive appropriate correction; have recurring mistakes remembered and practised later automatically; learn grammar beginner→advanced; practise pronunciation, IPA, tongue twisters, listening, shadowing, vocabulary, idioms, phrasal verbs, collocations, casual/modern/formal/professional/executive English, writing, reading, sales conversations; negotiate with realistic AI clients; give presentations; debate; complete roleplays; journal; follow adaptive daily training; view long-term progress; export data; use the app on phone and desktop.

---

# 94. FINAL DELIVERY REQUIREMENTS

Provide: architecture summary; repository structure; setup instructions; env template; schema/migrations; AI provider config; voice provider config; local dev commands; deployment instructions; test results; E2E results; security review; known limitations; screenshots; route inventory; feature checklist.

Create: README.md, docs/architecture.md, docs/ai-system.md, docs/curriculum-engine.md, docs/mistake-memory.md, docs/scoring.md, docs/voice.md, docs/database.md, docs/testing.md, docs/deployment.md.

---

# 95. REQUIREMENT TRACEABILITY

Checklist mapping every numbered section to: Implemented; Tested; Verified; Relevant files; Relevant tests. Do not declare completion until every applicable requirement has a status.

---

# 96. FINAL PRODUCT STANDARD

Private English professor + conversation partner + pronunciation specialist + grammar teacher + vocabulary coach + listening trainer + writing editor + business communication coach + sales coach + negotiation coach + presentation coach + public-speaking trainer + persistent learning analyst, inside one application.

After several months the system should know: what he repeatedly gets wrong; what he has mastered; what words he avoids; what sounds cause difficulty; where his speech slows; which fillers he overuses; which grammar patterns relapse; how he performs under negotiation pressure; how his writing changes; which exercise is most valuable next.

That adaptive behaviour is the central product.

---

# 97. START EXECUTION

Inspect repo → create docs/master-spec.md → create traceability matrix → design DB and architecture → write implementation plan → identify provider dependencies → verify their APIs → implement systematically → test every subsystem → final E2E QA.

Do not reduce scope without explicitly documenting the technical reason. Make sensible engineering decisions autonomously. Do not deploy to production, purchase paid services, delete existing data, or make irreversible external changes without explicit approval.

---

# APPENDIX A — Decisions confirmed with the learner (2026-09-30)

| Decision | Choice | Rationale |
|---|---|---|
| AI provider | OpenAI as default implementation (keys to be supplied later); deterministic `MockProvider` for local dev and tests | One key covers LLM + STT + TTS; provider interfaces keep the core vendor-neutral |
| LLM models | `gpt-6-astra` (tutor/complex eval), `gpt-6.1-sol` (balanced), `gpt-6-luna` (cheap evaluators) | Verified in official model catalogue |
| STT | `gpt-transcribe` (default transcript); `whisper-1` + `verbose_json` + `timestamp_granularities:["word"]` when word timestamps are required for pause/fluency metrics | Word timestamps are only supported on `whisper-1` per official docs |
| TTS | `gpt-4o-mini-tts` | Official low-latency TTS model |
| Structured output | Responses API `responses.parse` + `zodTextFormat` | Official structured-output path |
| Database | PostgreSQL via Drizzle ORM; local dev uses embedded PGlite (`drizzle-orm/pglite`), production uses hosted Postgres/Supabase with identical migrations | No Docker/Postgres on the dev machine |
| Auth | Magic link via Resend, single allowlisted email from env; dev fallback prints the link to the server console when `RESEND_API_KEY` is absent | Learner's choice |
| Audio storage | Local private filesystem directory in dev; provider interface for private object storage (Supabase Storage) in production | Audio retention defaults to Off |
