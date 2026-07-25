export function activateOnEnterOrSpace(event, activate) {
  if (event.key !== 'Enter' && event.key !== ' ') return false
  event.preventDefault()
  activate()
  return true
}
