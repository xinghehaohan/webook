const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 5
let failures: number[] = []

export function canAttemptLogin(now = Date.now()): boolean {
  failures = failures.filter((time) => now - time < WINDOW_MS)
  return failures.length < MAX_FAILURES
}

export function recordLoginFailure(now = Date.now()) {
  failures = failures.filter((time) => now - time < WINDOW_MS)
  failures.push(now)
}

export function clearLoginFailures() {
  failures = []
}
