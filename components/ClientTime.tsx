"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export default function ClientTime() {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    setTime(format(new Date(), "HH:mm:ss"))
    const interval = setInterval(() => {
      setTime(format(new Date(), "HH:mm:ss"))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return <span suppressHydrationWarning>{time}</span>
}