"use client"

import { useState, useRef, useCallback } from 'react'

export interface TestCase {
  input: any[]
  expected: any
  description?: string
}

export interface TestResult {
  testIndex: number
  passed: boolean
  input: any[]
  expected: any
  actual: any
  executionTime: number
  error: string | null
}

export interface ConsoleOutput {
  type: 'log' | 'error' | 'warn' | 'info'
  args: string[]
}

export interface RunResult {
  success: boolean
  error: string | null
  consoleOutput: ConsoleOutput[]
  testResults: TestResult[]
}

export function useCodeRunner() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanupWorker = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
    }
  }, [])

  const handleResult = useCallback(
    (payload: RunResult) => {
      cleanupWorker()
      setResult(payload)
      setIsRunning(false)
    },
    [cleanupWorker]
  )

  const handleFailure = useCallback(
    (message: string) => {
      cleanupWorker()
      setResult({
        success: false,
        error: message,
        consoleOutput: [],
        testResults: [],
      })
      setIsRunning(false)
    },
    [cleanupWorker]
  )

  const initializeWorker = useCallback(() => {
    cleanupWorker()
  }, [cleanupWorker])

  const runCode = useCallback(
    (code: string, tests: TestCase[], timeout = 5000) => {
      if (isRunning) {
        return
      }

      cleanupWorker()

      const worker = new Worker('/sandbox-worker.js')
      workerRef.current = worker

      setIsRunning(true)
      setResult(null)

      worker.onmessage = (e) => {
        const { type, ...data } = e.data

        if (type === 'result') {
          handleResult(data as RunResult)
          return
        }

        if (type === 'error' || type === 'timeout') {
          handleFailure(data.message)
          return
        }

        if (type === 'stopped') {
          cleanupWorker()
          setIsRunning(false)
        }
      }

      worker.onerror = (error) => {
        handleFailure('Worker error: ' + error.message)
      }

      worker.postMessage({
        type: 'run',
        code,
        tests,
        timeout,
      })

      timeoutRef.current = setTimeout(() => {
        handleFailure('Code execution timed out')
      }, timeout)
    },
    [cleanupWorker, handleFailure, handleResult, isRunning]
  )

  const stopExecution = useCallback(() => {
    if (!isRunning) {
      return
    }

    cleanupWorker()
    setResult({
      success: false,
      error: 'Execution stopped',
      consoleOutput: [],
      testResults: [],
    })
    setIsRunning(false)
  }, [cleanupWorker, isRunning])

  return {
    isRunning,
    result,
    runCode,
    stopExecution,
    cleanup: cleanupWorker,
    initializeWorker,
  }
}
