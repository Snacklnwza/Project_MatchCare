const bangkokCalendar = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Bangkok',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

export function getPatientAge(birthDate, asOf = new Date()) {
  if (typeof birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return null
  }

  const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number)
  const parsedBirthDate = new Date(`${birthDate}T00:00:00Z`)
  if (
    parsedBirthDate.getUTCFullYear() !== birthYear ||
    parsedBirthDate.getUTCMonth() + 1 !== birthMonth ||
    parsedBirthDate.getUTCDate() !== birthDay
  ) {
    return null
  }

  const today = Object.fromEntries(
    bangkokCalendar
      .formatToParts(asOf)
      .filter((part) => ['year', 'month', 'day'].includes(part.type))
      .map((part) => [part.type, Number(part.value)]),
  )
  const age =
    today.year -
    birthYear -
    (today.month < birthMonth ||
    (today.month === birthMonth && today.day < birthDay)
      ? 1
      : 0)

  return age >= 0 ? age : null
}

export function formatPatientAge(birthDate) {
  const age = getPatientAge(birthDate)
  return age === null ? 'ไม่ระบุอายุ' : `อายุ ${age} ปี`
}
