// Numerical Recipes 3rd ed., Section 6.14: Inverse Incomplete Beta Function
// Returns x such that I_x(a, b) = p, where I is the regularized incomplete beta.
// Algorithm: rational approximation initial guess + Halley's method refinement.

const EPS = 1e-12

function logGamma(x: number): number {
  // Lanczos approximation
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
             -1.231739572450155, 0.001208650973866179, -0.000005395239384953]
  let y = x
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) {
    y += 1
    ser += c[j] / y
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x)
}

function betaCF(a: number, b: number, x: number): number {
  const MAXIT = 200
  const FPMIN = 1e-300
  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  let c = 1
  let d = 1 - qab * x / qap
  if (Math.abs(d) < FPMIN) d = FPMIN
  d = 1 / d
  let h = d
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    h *= d * c
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < EPS) break
  }
  return h
}

function regularizedIncompleteBeta(a: number, b: number, x: number): number {
  if (x === 0) return 0
  if (x === 1) return 1
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x),
  )
  if (x < (a + 1) / (a + b + 2)) {
    return bt * betaCF(a, b, x) / a
  }
  return 1 - bt * betaCF(b, a, 1 - x) / b
}

export function betaQuantile(p: number, a: number, b: number): number {
  if (p <= 0) return 0
  if (p >= 1) return 1

  // Initial guess (Numerical Recipes 6.14.13)
  let x: number
  const lna = Math.log(a / (a + b))
  const lnb = Math.log(b / (a + b))
  const t = Math.sqrt(-2 * Math.log(p < 0.5 ? p : 1 - p))
  if (a > 1 && b > 1) {
    const r = (Math.sqrt(-Math.log(p * (1 - p))))
    let y = (r - (2.30753 + 0.27061 * r) / (1 + (0.99229 + 0.04481 * r) * r))
    if (p < 0.5) y = -y
    const al = (y * y - 3) / 6
    const h = 2 / (1 / (2 * a - 1) + 1 / (2 * b - 1))
    const w = (y * Math.sqrt(al + h) / h) -
              (1 / (2 * b - 1) - 1 / (2 * a - 1)) *
              (al + 5 / 6 - 2 / (3 * h))
    x = a / (a + b * Math.exp(2 * w))
  } else {
    const lna_ = Math.log(a / (a + b))
    const lnb_ = Math.log(b / (a + b))
    const t_ = Math.exp(a * lna_) / a
    const u_ = Math.exp(b * lnb_) / b
    const w_ = t_ + u_
    if (p < t_ / w_) x = Math.pow(a * w_ * p, 1 / a)
    else x = 1 - Math.pow(b * w_ * (1 - p), 1 / b)
  }
  // Suppress unused-variable warnings for vars declared per spec but only
  // referenced inside the (a<=1 || b<=1) branch via shadowed locals.
  void lna
  void lnb
  void t

  // Halley's method refinement
  const afac = -logGamma(a) - logGamma(b) + logGamma(a + b)
  for (let j = 0; j < 10; j++) {
    if (x === 0 || x === 1) return x
    const err = regularizedIncompleteBeta(a, b, x) - p
    let t_ = Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) + afac)
    const u = err / t_
    t_ = u / (1 - 0.5 * Math.min(1, u * ((a - 1) / x - (b - 1) / (1 - x))))
    x -= t_
    if (x <= 0) x = 0.5 * (x + t_)
    if (x >= 1) x = 0.5 * (x + t_ + 1)
    if (Math.abs(t_) < EPS * x && j > 0) break
  }
  return x
}
