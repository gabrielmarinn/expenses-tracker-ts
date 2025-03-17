import fs from 'fs'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { v4 as uuidv4 } from 'uuid'

const FILE_PATH = 'expenses.json'

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

const loadExpenses = (): Expense[] => {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8')
    const expenses: Expense[] = JSON.parse(data)

    return expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    }))
  } catch (error) {
    return []
  }
}

const saveExpenses = (expenses: Expense[]): void => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(expenses, null, 2))
}

const addExpense = async (): Promise<void> => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Description of expenditure:',
    },

    {
      type: 'input',
      name: 'amount',
      message: 'Value of expenditure:',
      validate: (value: string) => {
        const numberValue = Number(value)
        return numberValue > 0 ? true : 'The value must be positive'
      },
    },

    {
      type: 'list',
      name: 'category',
      message: 'Category',
      choices: ['Food', 'Transport', 'Leisure', 'Health', 'Others'],
    },
  ])

  const expenses = loadExpenses()
  expenses.push({ id: uuidv4(), ...answers, date: new Date().toISOString() })
  saveExpenses(expenses)
  console.log(chalk.green('Expenses added successfully!'))
}

const listExpenses = (): void => {
  const expenses = loadExpenses()
  if (expenses.length === 0) {
    console.log(chalk.yellow('Expenses not found'))
    return
  }
  console.log(chalk.blue('\n Expenses List:'))
  expenses.forEach((expense, index) => {
    console.log(
      `${chalk.magenta(index + 1)}. ${chalk.cyan(
        expense.description
      )} - ${chalk.green(`R$ ${expense.amount.toFixed(2)}`)} - ${chalk.yellow(
        expense.category
      )}`
    )
  })
}

const showSummary = (): void => {
  const expenses = loadExpenses()
  if (expenses.length === 0) {
    console.log(chalk.yellow('Expenses not found'))
    return
  }
  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )
  console.log(chalk.green(`\n Total expenses: R$ ${total.toFixed(2)}`))
}

const deleteExpense = async (): Promise<void> => {
  const expenses = loadExpenses()
  if (expenses.length === 0) {
    console.log(chalk.yellow('No expenses to remove'))
    return
  }
  const { index } = await inquirer.prompt([
    {
      type: 'list',
      name: 'index',
      message: 'Select the expense to remove:',
      choices: expenses.map((e, i) => ({
        name: `${e.description} - R$ ${e.amount.toFixed(2)}`,
        value: i,
      })),
    },
  ])
  expenses.splice(index, 1)
  saveExpenses(expenses)
  console.log(chalk.red('Expenses removed'))
}

const menu = async (): Promise<void> => {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
          'Add expense',
          'List expenses',
          'Remove expense',
          'Summary expenses',
          'Exit',
        ],
      },
    ])

    if (action === 'Add expense') await addExpense()
    if (action === 'List expenses') listExpenses()
    if (action === 'Remove expense') await deleteExpense()
    if (action === 'Summary expenses') showSummary()
    if (action === 'Exit') break
  }
}

menu()
