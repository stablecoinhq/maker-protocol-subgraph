import { bytes, units } from '@protofire/subgraph-toolkit'
import { Kick, LogNote } from '../../../../generated/Flop/Flopper'
import { system as systemModule, protocolParameterChangeLogs as changeLogs } from '../../../entities'
import { auctions } from '../../../entities/auctions'
import { LiveChangeLog } from '../../../../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleFile(event: LogNote): void {
  let what = event.params.arg1.toString()
  let data = bytes.toUnsignedInt(event.params.arg2)

  let system = systemModule.getSystemState(event)

  if (what == 'beg') {
    system.debtAuctionMinimumBidIncrease = units.fromWad(data)
    changeLogs.createProtocolParameterChangeLog(event, "FLOP", what, "",
      new changeLogs.ProtocolParameterValueBigDecimal(units.fromWad(data)))
  } else if (what == 'pad') {
    system.debtAuctionLotSizeIncrease = units.fromWad(data)
    changeLogs.createProtocolParameterChangeLog(event, "FLOP", what, "",
      new changeLogs.ProtocolParameterValueBigDecimal(units.fromWad(data)))
  } else if (what == 'ttl') {
    system.debtAuctionBidDuration = data
    changeLogs.createProtocolParameterChangeLog(event, "FLOP", what, "",
      new changeLogs.ProtocolParameterValueBigInt(data))
  } else if (what == 'tau') {
    system.debtAuctionDuration = data
    changeLogs.createProtocolParameterChangeLog(event, "FLOP", what, "",
      new changeLogs.ProtocolParameterValueBigInt(data))
  }

  system.save()
}

// Change Liveness of Flopper Contract
export function handleCage(event: LogNote): void {
  let log = new LiveChangeLog(event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-0')
  log.contract = event.address
  log.block = event.block.number
  log.timestamp = event.block.timestamp
  log.transaction = event.transaction.hash

  log.save()
}

// Restarts an auction
export function handleTick(event: LogNote): void {
  let ONE = units.WAD // 1E18 from https://github.com/protofire/subgraph-toolkit
  let id = bytes
    .toUnsignedInt(event.params.arg1)
    .toString()
    .concat('-')
    .concat('debt')

  let auction = auctions.loadOrCreateDebtAuction(id, event)
  let system = systemModule.getSystemState(event)

  let lotSizeIncrease = system.debtAuctionLotSizeIncrease // pad (name in contract)
  let auctionBidDuration = system.debtAuctionBidDuration // ttl
  let quantity = auction.quantity //lot

  if (lotSizeIncrease && auctionBidDuration) {
    let mul = lotSizeIncrease.times(quantity.toBigDecimal())
    auction.quantity = units.toWad(mul.div(ONE)) // WAD
    auction.endTimeAt = event.block.timestamp.plus(auctionBidDuration)

    auction.updatedAt = event.block.timestamp
    auction.save()
  }
}

//  claim a winning bid / settles a completed auction
export function handleDeal(event: LogNote): void {
  let id = bytes
    .toUnsignedInt(event.params.arg1)
    .toString()
    .concat('-')
    .concat('debt')
  let auction = auctions.loadOrCreateDebtAuction(id, event)

  //auction to inactive "delete"
  auction.deletedAt = event.block.timestamp
  auction.active = false

  auction.save()
}

export function handleKick(event: Kick): void {
  let id = event.params.id
    .toString()
    .concat('-')
    .concat('debt')
  let lot = event.params.lot
  let bid = event.params.bid
  let gal = event.params.gal

  let auction = auctions.loadOrCreateDebtAuction(id, event)
  auction.bidAmount = bid
  auction.quantity = lot
  auction.highestBidder = gal

  let system = systemModule.getSystemState(event)
  if (system.debtAuctionBidDuration) {
    auction.endTimeAt = event.block.timestamp.plus(system.debtAuctionBidDuration!)
  }
  auction.save()
}

export function handleDent(event: LogNote): void {
  let id = bytes
    .toUnsignedInt(event.params.arg1)
    .toString()
    .concat('-')
    .concat('debt')
  let auction = auctions.loadOrCreateDebtAuction(id, event)
  auction.highestBidder = event.transaction.from
  auction.quantity = BigInt.fromUnsignedBytes(event.params.arg2)

  let system = systemModule.getSystemState(event)
  if (system.debtAuctionBidDuration) {
    auction.endTimeAt = event.block.timestamp.plus(system.debtAuctionBidDuration!)
  }
  auction.save()
}

export function handleYank(event: LogNote): void {
  let id = bytes
    .toUnsignedInt(event.params.arg1)
    .toString()
    .concat('-')
    .concat('debt')

  let auction = auctions.loadOrCreateDebtAuction(id, event)
  auction.active = false
  auction.deletedAt = event.block.timestamp
  auction.save()
}
