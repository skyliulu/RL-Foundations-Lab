# RL Foundations Lab

[简体中文](./README.md) · English

[Live site](https://skyliulu.github.io/RL-Foundations-Lab/) · [GitHub repository](https://github.com/skyliulu/RL-Foundations-Lab)

**Interactive reinforcement learning from grid worlds to PPO and language-model post-training.**

RL Foundations Lab is a bilingual interactive course for learners who already know basic probability, calculus, and optimization. It follows the conceptual spine of *Mathematical Foundations of Reinforcement Learning* without flattening the material into isolated cards: definitions, derivations, algorithmic motivation, pseudocode, and limitations remain part of a continuous narrative, while embedded experiments expose the internal state that would otherwise require writing and running code.

The course is designed to answer more than “how does the algorithm work?” It asks why the previous method is insufficient, what the new mechanism changes, why the mathematics is valid, and how a parameter change propagates through the algorithm to the observed result.

## Learning path

The course contains 16 chapters. Chinese is the default language, and the complete experience is also available in English.

### Part I · Mathematical foundations and dynamic programming

- **01 Grid World and interaction basics**: states, actions, rewards, policies, environment models, and the Markov property.
- **02 Return and state value**: from reward sequences and discounted returns to value functions.
- **03 Bellman equation**: derive the one-step recursion from the definition of value.
- **04 Bellman optimality**: let action values compete and explain where an optimal policy comes from.
- **05 Update order and convergence**: compare Value Iteration, Policy Iteration, and Truncated Policy Iteration.

### Part II · Model-free learning

- **06 Monte Carlo learning**: from complete episodes to Basic MC, Exploring Starts, and ε-greedy control.
- **07 Stochastic approximation and step sizes**: incremental means, noise, step-size conditions, and convergence trade-offs.
- **08 TD prediction**: use bootstrapping to update value before an episode terminates.
- **09 Sarsa and Q-learning**: compare the targets and behavior of on-policy and off-policy control.

### Part III · Function approximation and policy learning

- **10 Value function approximation**: share parameters so one sample can affect similar states.
- **11 Deep Q-learning**: understand replay buffers, target networks, and training stability.
- **12 Policy gradient**: optimize the policy directly and derive the gradient estimator and its variance.
- **13 Actor–Critic**: improve the actor using value estimates supplied by the critic.

### Part IV · PPO and language-model post-training

- **14 PPO**: from advantages and importance ratios to the clipped surrogate objective.
- **15 Token MDP**: map prompts, tokens, responses, and sequence rewards to reinforcement-learning objects.
- **16 PPO system view**: place the policy, reference, reward, and value models around one shared rollout batch.

## Interactive learning

The interactions are part of the argument, not animations appended to the article. The course currently includes:

- one shared 5×5 Course World across the classical chapters, exposing how states, actions, rewards, policies, and values change together;
- Return Observatory, Bellman Microscope, Optimality Switch, and Planning Arena for tracing returns, one-step backups, action competition, and convergence;
- a Monte Carlo episode tape, action-value table, and policy update view for comparing MC control methods on the same trajectory;
- chapter-level parameter experiments for stochastic approximation, TD, Sarsa/Q-learning, function approximation, DQN, Policy Gradient, and Actor–Critic;
- PPO Clip Plane, where sample-level ratios and advantages reveal exactly which updates are clipped;
- Token Trajectory Lab and the PPO system view, keeping one rollout batch traceable between mathematical objectives and engineering components.

Derivations keep their complete chain of equalities visible. Each step can be selected to inspect its rule, assumptions, symbol definitions, and current numerical interpretation in the right-hand workbench.

## Product principles

- **Explain why before presenting how**: every mechanism begins with the limitation of the preceding method.
- **Preserve the mathematical spine**: interaction strengthens the required definitions and derivations; it does not replace them.
- **Share state across evidence**: canvases, tables, plots, and numerical formulas read from the same experiment state.
- **Stateless and browser-only**: no account, saved progress, persisted parameters, or remote compute API is required; the header only reads the public GitHub star count anonymously.
- **Structurally equivalent bilingual content**: both languages share chapters, mathematics, experiments, and references.

## Run locally

Node.js and npm are required.

```bash
npm install
npm run dev
```

Run the test suite and production build:

```bash
npm test
npm run build
```

## Project status and boundaries

Chapters 01–16 form a runnable bilingual path from classical foundations through model-free learning and function approximation to PPO and language-model post-training. Some middle-course interactions are still evolving from parameter labs into more explicit visualizations of algorithm-internal state.

This is a teaching tool, not a general-purpose RL training framework. Every experiment runs in the browser. Grid World uses exact or reproducible instructional computation, while the PPO and language-model chapters do not train real neural networks or require backend compute.

## References

- [Mathematical Foundations of Reinforcement Learning](https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning)
- [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347)
- [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)

Each chapter also ends with sources mapped directly to its definitions, derivations, and algorithms.

## Project documents

- [Product blueprint](./PRODUCT_BLUEPRINT.md)
- [Curriculum map](./CURRICULUM_MAP.md)
- [Chapter rebuild audit](./CHAPTER_REBUILD_AUDIT.md)
- [Execution roadmap](./EXECUTION_ROADMAP.md)
