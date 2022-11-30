import { ethereum, Address } from '@graphprotocol/graph-ts'
import { decimal, integer, units } from '@protofire/subgraph-toolkit'

import { SystemState } from '../../generated/schema'
import { Vat } from '../../generated/Vat/Vat'
export namespace system {
  export function getSystemState(event: ethereum.Event): SystemState {
    let vatContract = Vat.bind(Address.fromString('0x1b1FE236166eD0Ac829fa230afE38E61bC281C5e'))
    let state = SystemState.load('current')

    if (state == null) {
      state = new SystemState('current')

      state.totalDebt = decimal.ZERO
      state.totalSystemDebt = decimal.ZERO // Unbacked Dai

      // Entities counters
      state.collateralCount = integer.ZERO
      state.userProxyCount = integer.ZERO
      state.unmanagedVaultCount = integer.ZERO
      state.vaultCount = integer.ZERO

      // System parameters
      state.baseStabilityFee = decimal.ONE
      state.savingsRate = decimal.ONE
      state.totalDebtCeiling = decimal.ZERO

      // DAI Erc.20 parameters
      state.daiTotalSupply = decimal.ZERO

      // pot parameters
      state.dsrLiveUpdatedAt = event.block.timestamp
      state.dsrLive = true

      // dog parameters
      state.totalDaiAmountToCoverDebtAndFees = decimal.ZERO
    }

    // Hotfix for totalDebt
    let debt = vatContract.try_debt();
    state.totalDebt = debt.reverted ? state.totalDebt : units.fromRad(debt.value);

    return state as SystemState
  }
}
