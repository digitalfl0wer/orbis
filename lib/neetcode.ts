export interface NeetCodeProblem {
  id: string
  title: string
  prompt: string
  constraints?: string
  examples?: string
  tags?: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
}

export const neetCodeProblems: NeetCodeProblem[] = [
  {
    id: "two-sum-ii",
    title: "Two Sum II - Input Array Is Sorted",
    prompt:
      "Given a 1-indexed array of integers `numbers` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number. Return the indices of the two numbers.",
    constraints: "2 <= numbers.length <= 3 * 10^4; -1000 <= numbers[i] <= 1000; numbers is sorted.",
    examples: "Input: numbers = [2,7,11,15], target = 9 → Output: [1,2]",
    tags: ["two pointers", "array"],
    difficulty: "beginner",
  },
  {
    id: "add-two-numbers",
    title: "Add Two Numbers",
    prompt:
      "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order. Add the two numbers and return the sum as a linked list.",
    constraints: "The number of nodes in each list is in the range [1, 100]. 0 <= Node.val <= 9.",
    examples: "Input: l1 = [2,4,3], l2 = [5,6,4] → Output: [7,0,8]",
    tags: ["linked list", "math"],
    difficulty: "beginner",
  },
  {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    prompt:
      "You are given an array `prices` where prices[i] is the price of a given stock on the i-th day. Find the maximum profit by choosing a single day to buy and a different day to sell.",
    constraints: "1 <= prices.length <= 10^5; 0 <= prices[i] <= 10^4",
    examples: "Input: [7,1,5,3,6,4] → Output: 5",
    tags: ["array", "dynamic programming"],
    difficulty: "intermediate",
  },
  {
    id: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    prompt:
      "Given a string s, return the longest palindromic substring in s.",
    constraints: "1 <= s.length <= 1000",
    examples: "Input: s = 'babad' → Output: 'bab' or 'aba'",
    tags: ["strings", "two pointers"],
    difficulty: "intermediate",
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    prompt:
      "Given a string s containing just the characters '()[]{}', determine if the input string is valid.",
    constraints: "1 <= s.length <= 10^4",
    examples: "Input: s = '()[]{}' → true",
    tags: ["stack"],
    difficulty: "beginner",
  },
]

