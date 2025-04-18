// Generated by CoffeeScript 2.7.0
var Expense

import Manager from '../managers/manager'

import moment from 'moment'

import DateFormats from '../constants/datetimeFormats'

export default Expense = class Expense {
  constructor(
    id = Manager.getUid(),
    name = '',
    imageName = '',
    shareWith = [],
    amount = 0,
    creationDate = moment().format(DateFormats.dateForDb),
    paidStatus = 'unpaid',
    children = [],
    dueDate = '',
    ownerKey = '',
    notes = '',
    recipientName = '',
    isRecurring = false,
    recurringFrequency = '',
    category = '',
    payer = {
      phone: '',
      key: '',
      name: '',
    }
  ) {
    this.id = id
    this.name = name
    this.imageName = imageName
    this.shareWith = shareWith
    this.amount = amount
    this.creationDate = creationDate
    this.paidStatus = paidStatus
    this.children = children
    this.dueDate = dueDate
    this.ownerKey = ownerKey
    this.notes = notes
    this.recipientName = recipientName
    this.isRecurring = isRecurring
    this.recurringFrequency = recurringFrequency
    this.category = category
    this.payer = payer
  }
}

//# sourceMappingURL=expense.js.map