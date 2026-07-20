import {
  ACTIONS,
  START,
  allStates,
  indexOf,
  isForbidden,
  isGoal,
  isSame,
  keyOf,
} from '../engine/gridworld'

export default function CourseWorldOverview({ content }) {
  return (
    <figure className="course-world-overview" aria-labelledby="course-world-overview-title">
      <figcaption>
        <span>{content.eyebrow}</span>
        <h3 id="course-world-overview-title">{content.title}</h3>
        <p>{content.caption}</p>
      </figcaption>
      <div className="course-world-overview-body">
        <div className="course-world-overview-map">
          <div className="overview-map-label"><span>{content.map}</span><small>5 × 5</small></div>
          <div className="overview-world-grid">
            {allStates().map((state) => (
              <span
                key={keyOf(state)}
                className={`overview-world-cell${isForbidden(state) ? ' forbidden' : ''}${isGoal(state) ? ' goal' : ''}${isSame(state, START) ? ' start' : ''}`}
              >
                <b>{content.statePrefix}{indexOf(state) + 1}</b>
                {isSame(state, START) && <small>{content.start}</small>}
                {isGoal(state) && <small>{content.target}</small>}
              </span>
            ))}
          </div>
          <div className="overview-world-legend">
            <span><i className="legend-forbidden" />{content.forbidden}</span>
            <span><i className="legend-goal" />{content.target}</span>
            <span><i className="legend-start" />{content.start}</span>
          </div>
        </div>
        <div className="course-world-overview-reading">
          <dl>
            <div><dt>01</dt><dd><strong>{content.locationTitle}</strong><span>{content.locationBody}</span></dd></div>
            <div><dt>02</dt><dd><strong>{content.choiceTitle}</strong><span>{content.choiceBody}</span></dd></div>
            <div><dt>03</dt><dd><strong>{content.responseTitle}</strong><span>{content.responseBody}</span></dd></div>
          </dl>
          <div className="overview-action-key" aria-label={content.choiceTitle}>
            {['up', 'right', 'down', 'left', 'stay'].map((action) => <span key={action}>{ACTIONS[action].arrow}</span>)}
          </div>
          <p>{content.boundary}</p>
        </div>
      </div>
    </figure>
  )
}
