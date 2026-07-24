const required = (id, type, label, destinations, sourceIds = []) => ({
  id,
  type,
  label,
  classification: 'main-path-required',
  destinations,
  sourceIds,
})

const optional = (id, type, label, destinations, sourceIds = []) => ({
  id,
  type,
  label,
  classification: 'optional-deepening',
  destinations,
  sourceIds,
})

const chapter = (sourceBasis, items) => ({ sourceBasis, items })

export const sourceCoverageMatrix = Object.freeze({
  mdp: chapter(
    ['coursebook-chapter-1', 'llm-infra-sections-1-2'],
    [
      required('interaction-loop', 'definition', 'Agent–environment interaction loop', ['problem-setting'], ['grid-world']),
      required('state-action-policy-reward', 'definition', 'State, action, policy, and reward', ['state-space', 'action-space', 'policy', 'reward-model'], ['grid-world', 'policy-reward']),
      required('transition-model', 'definition', 'Transition probability and environment response', ['transition-model'], ['mdp']),
      required('trajectory-return', 'worked-example', 'One policy-generated trajectory and its return', ['trajectory-return'], ['grid-world']),
      required('episodic-continuing', 'comparison', 'Episodic and continuing tasks', ['task-types', 'termination-counterfactual'], ['mdp']),
      required('markov-sufficiency', 'definition', 'Markov state and state sufficiency', ['mdp-definition', 'state-sufficiency-counterexample'], ['mdp']),
    ],
  ),
  returns: chapter(
    ['coursebook-chapter-1', 'llm-infra-section-2'],
    [
      required('discounted-return', 'definition', 'Finite and discounted return', ['reward-to-return', 'finite-return', 'discounted-return'], ['trajectory-return', 'discount-continuing']),
      required('return-recursion', 'derivation', 'One-step return recursion', ['split-first-term', 'return-recursion'], ['trajectory-return']),
      required('state-value', 'definition', 'State value as expected return', ['state-value', 'return-distribution'], ['state-value']),
      required('backward-return', 'worked-example', 'Forward summation and backward return recursion', ['two-return-calculations'], ['trajectory-return']),
      required('continuing-return', 'comparison', 'Discounting in continuing tasks', ['discount-boundary', 'continuing-transfer'], ['discount-continuing']),
    ],
  ),
  bellman: chapter(
    ['coursebook-chapter-2', 'llm-infra-section-3'],
    [
      required('bellman-expectation', 'derivation', 'Bellman expectation equation from return recursion', ['value-definition', 'substitute-return-recursion', 'total-expectation', 'recognize-successor-value', 'bellman-equation'], ['return-recursion', 'bellman-derivation']),
      required('four-state-system', 'worked-example', 'Four-state coupled Bellman system', ['four-state-worked-system'], ['bellman-derivation']),
      required('matrix-solution', 'comparison', 'Matrix solution and iterative policy evaluation', ['matrix-and-iteration'], ['matrix-policy-evaluation']),
      required('bootstrapping', 'definition', 'One-step target and bootstrapping', ['target-anatomy', 'bootstrapping'], ['bellman-derivation']),
      required('action-value', 'definition', 'Action value and its relation to state value', ['state-to-action-value', 'action-value-transfer'], ['action-value']),
    ],
  ),
  optimality: chapter(
    ['coursebook-chapter-3', 'llm-infra-section-4'],
    [
      required('expectation-to-max', 'derivation', 'Policy expectation to Bellman optimality maximum', ['evaluation-control', 'max-reduction', 'policy-action-value', 'optimize-policy', 'convex-max', 'expand-q-star', 'optimality-equation'], ['action-improvement', 'boe-max']),
      required('optimal-fixed-point', 'theorem', 'Optimal Bellman fixed point', ['fixed-point-optimality'], ['boe-max']),
      required('contraction', 'theorem', 'Contraction and uniqueness of the optimality operator', ['contraction-proof'], ['boe-max']),
      required('greedy-recovery', 'theorem', 'Recovering an optimal greedy policy from optimal value', ['greedy-policy-proof'], ['optimal-policy']),
      optional('reward-transformations', 'counterexample', 'Reward and discount transformations', ['reward-horizon', 'reward-transformations'], ['optimal-policy']),
    ],
  ),
  planning: chapter(
    ['coursebook-chapter-4', 'llm-infra-section-5'],
    [
      required('value-iteration', 'algorithm', 'Value Iteration derivation and complete loop', ['value-iteration', 'vi-complete-loop'], ['value-iteration']),
      required('policy-iteration', 'algorithm', 'Policy Iteration evaluation–improvement loop', ['policy-iteration', 'policy-evaluation', 'policy-improvement', 'pi-four-whys'], ['policy-iteration']),
      required('truncated-pi', 'variant', 'Truncated Policy Iteration', ['truncated-evaluation', 'tpi-continuum'], ['truncated-pi']),
      required('evaluation-depth', 'comparison', 'VI, TPI, and PI as an evaluation-depth continuum', ['truncation-continuum', 'fair-budget'], ['value-iteration', 'policy-iteration', 'truncated-pi']),
      required('planning-grid', 'experiment', 'Planning under a shared grid and backup budget', ['chapter-experiment'], ['value-iteration', 'policy-iteration']),
    ],
  ),
  montecarlo: chapter(
    ['coursebook-chapter-5', 'llm-infra-section-6'],
    [
      required('mc-estimation', 'derivation', 'Episode return as an unbiased action-value sample', ['value-definition', 'episode-sample', 'sample-average', 'incremental-mean'], ['mc']),
      required('mc-basic', 'algorithm', 'MC Basic with complete pseudocode', ['basic'], ['mc']),
      required('exploring-starts', 'variant', 'MC Exploring Starts', ['exploring'], ['mc']),
      required('epsilon-greedy-mc', 'variant', 'MC epsilon-greedy control', ['policy-improvement', 'epsilon-greedy', 'epsilon'], ['mc']),
      required('visit-coverage', 'comparison', 'First/every visit and state–action coverage', ['visit-protocol', 'coverage'], ['mc']),
      required('mc-control-example', 'worked-example', 'Episode tape, return update, and policy improvement', ['control-loop', 'coverage'], ['mc']),
    ],
  ),
  approximation: chapter(
    ['coursebook-chapter-6', 'llm-infra-section-7'],
    [
      required('incremental-mean', 'derivation', 'Incremental sample mean', ['incremental-problem', 'incremental-mean', 'mean-check'], ['sa']),
      required('step-size-memory', 'comparison', 'Constant and diminishing step-size memory', ['step-size-memory'], ['sa']),
      required('robbins-monro', 'algorithm', 'Robbins–Monro root-finding loop', ['root-abstraction', 'root-check', 'rm-loop'], ['sa']),
      required('rm-convergence', 'theorem', 'Robbins–Monro step-size conditions and convergence meaning', ['rm-conditions'], ['sa']),
      required('sgd-derivation', 'derivation', 'SGD as stochastic approximation', ['mean-as-sgd', 'gradient-generalization', 'sgd-as-rm'], ['sa']),
      required('batch-family', 'comparison', 'Full-batch, mini-batch, and stochastic gradient updates', ['batch-motivation', 'gradient-family', 'sgd-loop', 'convergence-pattern'], ['sa']),
    ],
  ),
  td: chapter(
    ['coursebook-chapter-7', 'llm-infra-section-8'],
    [
      required('td-sample-target', 'derivation', 'One transition as a Bellman sample target', ['timing', 'bellman-sample-logic', 'bellman-root', 'sample-target'], ['td']),
      required('td-zero', 'algorithm', 'Complete TD(0) update loop', ['td-error', 'td-update', 'td-zero-complete'], ['td']),
      required('mc-td', 'comparison', 'MC and TD evidence, availability, bias, and variance', ['mc-td-matched-comparison', 'bias-variance'], ['td']),
      required('n-step-return', 'variant', 'n-step TD return', ['n-step'], ['td']),
      required('online-grid', 'experiment', 'Online value propagation in the shared grid', ['chapter-experiment', 'online'], ['td']),
    ],
  ),
  control: chapter(
    ['coursebook-chapter-7', 'llm-infra-section-8'],
    [
      required('sarsa', 'algorithm', 'Complete on-policy Sarsa loop', ['sarsa-target', 'sarsa-update', 'sarsa-complete-loop'], ['control']),
      required('q-learning', 'algorithm', 'Complete off-policy Q-learning loop', ['q-target', 'q-update', 'q-learning-off-policy'], ['control']),
      required('policy-roles', 'comparison', 'Behavior and target policy roles', ['policy-roles', 'fair-comparison'], ['control']),
      required('n-step-sarsa', 'variant', 'n-step Sarsa', ['n-step-and-cliff'], ['control']),
      required('cliff-world', 'worked-example', 'On-policy and off-policy behavior in the cliff world', ['n-step-and-cliff', 'chapter-experiment'], ['control']),
    ],
  ),
  vfa: chapter(
    ['coursebook-chapter-8', 'llm-infra-section-9'],
    [
      required('parameterized-value', 'definition', 'Parameterized value function', ['capacity', 'parameterization'], ['vfa']),
      required('weighted-objective', 'derivation', 'Weighted mean-squared value error', ['distribution', 'objective', 'objective-and-semi-gradient'], ['vfa']),
      required('semi-gradient', 'algorithm', 'Semi-gradient TD update', ['sample-target', 'semi-gradient'], ['vfa']),
      required('linear-features', 'worked-example', 'Linear features and parameter sharing', ['linear', 'linear-sharing', 'generalization', 'interference'], ['vfa']),
      required('approximate-control', 'variant', 'Approximate Sarsa and Q-learning control', ['approximate-control'], ['vfa']),
    ],
  ),
  dqn: chapter(
    ['coursebook-chapter-8', 'llm-infra-section-9'],
    [
      required('network-q', 'definition', 'Neural action-value approximation', ['coupling', 'network-q'], ['dqn']),
      required('moving-target', 'failure-case', 'Moving bootstrap target instability', ['two-instabilities', 'naive-target', 'moving-target'], ['dqn']),
      required('target-network', 'mechanism', 'Frozen target network and synchronization', ['target-network', 'sync'], ['dqn']),
      required('experience-replay', 'mechanism', 'Experience replay and replay loss', ['replay-why', 'replay-loss'], ['dqn']),
      required('dqn-loop', 'algorithm', 'Complete DQN training loop', ['dqn-complete'], ['dqn']),
      required('dqn-system', 'experiment', 'Replay buffer and target-network data flow', ['chapter-experiment'], ['dqn']),
    ],
  ),
  policygradient: chapter(
    ['coursebook-chapter-9', 'llm-infra-section-10'],
    [
      required('policy-objectives', 'comparison', 'Average-value and average-reward objectives', ['value-policy', 'objectives-and-occupancy', 'objective'], ['pg']),
      required('policy-gradient-theorem', 'theorem', 'Policy Gradient Theorem', ['theorem', 'theorem-to-samples'], ['pg']),
      required('log-derivative', 'derivation', 'Log-derivative sample estimator', ['log-trick', 'sample-gradient'], ['pg']),
      required('reinforce', 'algorithm', 'Complete REINFORCE loop', ['reinforce-complete'], ['pg']),
      required('baseline', 'variant', 'Action-independent baseline and variance reduction', ['baseline', 'variance'], ['pg']),
    ],
  ),
  actorcritic: chapter(
    ['coursebook-chapter-10', 'llm-infra-section-11'],
    [
      required('q-actor-critic', 'algorithm', 'Q Actor–Critic', ['q-gradient', 'qac-to-baseline'], ['ac']),
      required('baseline-invariance', 'theorem', 'Action-independent baseline invariance', ['baseline-invariance'], ['ac']),
      required('advantage-ac', 'variant', 'Advantage Actor–Critic and TD advantage', ['advantage', 'td-advantage'], ['ac']),
      required('a2c-loop', 'algorithm', 'Synchronized actor and critic updates', ['two-updates', 'a2c-shared-transition'], ['ac']),
      required('off-policy-ac', 'variant', 'Importance sampling and off-policy Actor–Critic', ['importance', 'off-policy-and-deterministic'], ['ac']),
      optional('deterministic-ac', 'variant', 'Deterministic Actor–Critic', ['off-policy-and-deterministic'], ['ac']),
    ],
  ),
  ppo: chapter(
    ['ppo-paper', 'llm-infra-section-12'],
    [
      required('actor-critic-interface', 'definition', 'Actor, critic, and advantage interface', ['actor-critic-loop', 'policy-gradient', 'baseline', 'td-advantage'], ['actor-critic']),
      required('importance-ratio', 'derivation', 'Old-to-new policy probability ratio', ['ratio', 'surrogate'], ['ppo-paper']),
      required('clipped-objective', 'derivation', 'Clipped surrogate objective and four sign cases', ['clipped-objective', 'ratio-to-clipping-cases'], ['ppo-paper']),
      required('gae', 'variant', 'Generalized advantage estimation', ['gae'], ['ppo-paper']),
      required('ppo-objective', 'algorithm', 'Complete PPO objective and update loop', ['full-objective', 'update-cycle', 'ppo-complete-loop'], ['ppo-paper']),
      required('clip-plane', 'experiment', 'Fixed-batch clipping counterfactual', ['chapter-experiment'], ['ppo-paper']),
    ],
  ),
  tokenmdp: chapter(
    ['rl-book', 'instructgpt', 'llm-infra-sections-12-13'],
    [
      required('token-mdp-map', 'definition', 'Prefix state, token action, transition, termination, and return', ['bridge', 'state', 'action-policy', 'transition', 'termination', 'reward-return'], ['rl-book', 'instructgpt']),
      required('markov-prefix', 'definition', 'Markov sufficiency of a prefix state', ['markov-sufficiency'], ['rl-book']),
      required('reward-placement', 'comparison', 'Sequence, process, terminal, and KL reward placement', ['reward-placement'], ['instructgpt']),
      required('rollout-contract', 'definition', 'Token-level rollout record', ['rollout-record'], ['instructgpt']),
      required('behavior-policy', 'mechanism', 'Decoding configuration as the behavior policy', ['sampling-policy'], ['instructgpt']),
      required('eos-truncation', 'comparison', 'EOS termination versus length truncation', ['terminal-vs-truncated', 'chapter-experiment'], ['rl-book']),
    ],
  ),
  rlhf: chapter(
    ['instructgpt', 'ppo', 'llm-infra-section-13'],
    [
      required('training-stages', 'comparison', 'SFT, reward modeling, and online PPO stages', ['pipeline-level'], ['instructgpt']),
      required('model-roles', 'definition', 'Policy, old, reference, reward, and value roles', ['role-separation', 'model-provenance', 'model-roles'], ['instructgpt', 'ppo']),
      required('sequence-reward', 'derivation', 'Sequence preference score to token reward', ['reward-model', 'reference-kl', 'sequence-to-token-reward'], ['instructgpt']),
      required('token-gae', 'derivation', 'Token value, GAE, and PPO targets', ['token-gae', 'ppo-update'], ['ppo']),
      required('batch-contract', 'definition', 'PPO batch provenance, alignment, and failure modes', ['batch-contract-and-failures', 'batch-contract'], ['instructgpt']),
      required('online-lifecycle', 'algorithm', 'Rollout, update, publish, and refresh lifecycle', ['refresh-loop', 'online-loop', 'chapter-experiment'], ['instructgpt']),
    ],
  ),
  dpo: chapter(
    ['dpo', 'llm-infra-section-14'],
    [
      required('regularized-policy', 'derivation', 'KL-regularized optimal policy and implicit reward', ['regularized-objective', 'optimal-policy', 'implicit-reward'], ['dpo']),
      required('preference-probability', 'derivation', 'Pairwise preference probability', ['pairwise-probability'], ['dpo']),
      required('dpo-loss', 'derivation', 'DPO binary logistic loss', ['dpo-loss'], ['dpo']),
      required('dpo-loop', 'algorithm', 'Complete DPO minibatch update', ['complete-dpo'], ['dpo']),
      required('preference-contract', 'definition', 'Chosen/rejected data contract', ['data-contract'], ['dpo']),
      required('preference-failures', 'comparison', 'Preference noise, style shortcuts, and distribution shift', ['failure-modes', 'offline-boundary'], ['dpo']),
    ],
  ),
  grpo: chapter(
    ['grpo', 'dapo', 'llm-infra-section-15'],
    [
      required('group-sampling', 'algorithm', 'Online grouped response sampling', ['why-online', 'group-sampling'], ['grpo']),
      required('relative-advantage', 'derivation', 'Group statistics and relative advantage', ['group-baseline', 'group-statistics', 'relative-advantage'], ['grpo']),
      required('grpo-objective', 'algorithm', 'Clipped GRPO update loop', ['clipped-update', 'complete-grpo'], ['grpo']),
      required('verifier', 'definition', 'Verifiable reward and its failure boundary', ['verifier'], ['grpo']),
      required('dynamic-sampling', 'variant', 'Dynamic sampling of informative groups', ['dynamic-sampling', 'zero-variance'], ['dapo']),
      optional('dapo-family', 'variant', 'Decoupled clipping and related stabilization', ['stability-family'], ['dapo']),
    ],
  ),
  codingrl: chapter(
    ['rlef', 'swerl', 'llm-infra-sections-15-16'],
    [
      required('execution-environment', 'definition', 'Repository, compiler, tests, and patch as an RL environment', ['code-as-action', 'test-vector'], ['rlef', 'swerl']),
      required('reward-aggregation', 'comparison', 'Outcome, partial, and weighted executable rewards', ['reward-design', 'outcome-reward', 'partial-reward', 'weighted-reward'], ['rlef']),
      required('coding-loop', 'algorithm', 'Complete coding rollout and update loop', ['complete-coding-loop'], ['rlef', 'swerl']),
      required('feedback-transition', 'mechanism', 'Execution feedback enters the next repair state', ['feedback-transition', 'feedback-types', 'iterative-repair'], ['swerl']),
      required('reward-hacking', 'failure-case', 'Visible-test overfitting and hidden-test audit', ['reward-hacking', 'chapter-experiment'], ['rlef', 'swerl']),
      required('sandbox-boundary', 'condition', 'Execution isolation and safety boundary', ['safety-boundary'], ['swerl']),
    ],
  ),
  agentmdp: chapter(
    ['agent-lightning', 'llm-infra-section-16'],
    [
      required('agent-state-action', 'definition', 'History state and structured tool action', ['beyond-response', 'decision-boundary', 'agent-state', 'structured-action'], ['agent-lightning']),
      required('environment-observation', 'definition', 'Tool execution, observation, and state update', ['environment-step', 'tool-errors'], ['agent-lightning']),
      required('trajectory-probability', 'derivation', 'Multi-turn trajectory probability', ['trajectory-probability'], ['agent-lightning']),
      required('terminal-objective', 'definition', 'Success, failure, termination, and budget', ['terminal-objective', 'budget'], ['agent-lightning']),
      required('agent-loop', 'algorithm', 'Complete tool-agent rollout loop', ['complete-agent-rollout'], ['agent-lightning']),
      required('partial-observability', 'comparison', 'Hidden environment state and observation sufficiency', ['partial-observability'], ['agent-lightning']),
      required('branching-tree', 'experiment', 'Controlled alternative tool branches', ['branching', 'chapter-experiment'], ['agent-lightning']),
    ],
  ),
  credit: chapter(
    ['agent-lightning', 'hcapo', 'llm-infra-section-16'],
    [
      required('terminal-broadcast', 'baseline', 'Terminal-outcome broadcast', ['sparse-delay', 'terminal-broadcast'], ['agent-lightning']),
      required('discounted-credit', 'variant', 'Discounted return over a long trajectory', ['discounted-return'], ['agent-lightning']),
      required('process-credit', 'variant', 'Process reward and verifier confidence', ['curriculum', 'process-reward'], ['hcapo']),
      required('segment-credit', 'variant', 'Tool-segment return and advantage', ['segmentation', 'segment-advantage'], ['agent-lightning']),
      required('bias-audit', 'comparison', 'Bias sources in dense credit', ['bias-audit'], ['hcapo']),
      required('hindsight-credit', 'variant', 'Hindsight attribution with counterfactual validation', ['hindsight-risk', 'hindsight-credit'], ['hcapo']),
      required('credit-toolbox', 'comparison', 'Task, process, value, segment, and hindsight signals', ['solution-toolbox', 'chapter-experiment'], ['agent-lightning', 'hcapo']),
    ],
  ),
})

export const coverageClassifications = Object.freeze([
  'main-path-required',
  'optional-deepening',
  'intentionally-out-of-scope',
])

export const coverageItemTypes = Object.freeze([
  'algorithm',
  'baseline',
  'comparison',
  'condition',
  'counterexample',
  'definition',
  'derivation',
  'experiment',
  'failure-case',
  'mechanism',
  'theorem',
  'variant',
  'worked-example',
])
