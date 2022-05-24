import { bytes, units } from '@protofire/subgraph-toolkit'

import { LogNote } from '../../../../generated/Vow/Vow'

import { system as systemModule } from '../../../entities'

import { LiveChangeLog, PushDebtQueueLog } from '../../../../generated/schema'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  let system = systemModule.getSystemState(event)

  if (what == 'wait') {
    system.debtAuctionDelay = data
  } else if (what == 'bump') {
    system.surplusAuctionLotSize = units.fromRad(data)
  } else if (what == 'sump') {
    system.debtAuctionBidSize = units.fromRad(data)
  } else if (what == 'dump') {
    system.debtAuctionInitialLotSize = units.fromWad(data)
  } else if (what == 'hump') {
    system.surplusAuctionBuffer = units.fromRad(data)
  }

  system.save()
}

// Change Liveness of Vow Contract
export function handleCage(event: LogNote): void {
  let log = new LiveChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
  log.contract = event.address
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

export function handleFess(event: LogNote): void {
  let tab = bytes.toUnsignedInt(event.params.arg1)
  let system = systemModule.getSystemState(event)
  system.systemDebtInQueue = system.systemDebtInQueue.plus(units.fromRad(tab))

  system.save()

  let log = new PushDebtQueueLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-1')
  log.amount = units.fromRad(tab)
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}