import { Bytes, Address, ethereum, crypto, ByteArray, log } from '@graphprotocol/graph-ts'
import { test, clearStore, assert } from 'matchstick-as'
import { LogNote } from '../../../../../generated/Flop/Flopper'
import { handleCage } from '../../../../../src/mappings/modules/system-stabilizer/flop'
import { tests } from '../../../../../src/mappings/modules/tests'

test('dsChief#handleEtch process event', () => {

    /**
     * 0x0000000000000000000000000000000000000000000000000000000000000020
     * 0x0000000000000000000000000000000000000000000000000000000000000003
     * 0x000000000000000000000000231d51dbec6e3e63ad22078c73b70fbfd1b14265
     * 0x000000000000000000000000e07351ecc2c326400b0ea49f1c45a94ff1b6ada8
     * 0x000000000000000000000000f71b70a4af37a8f8ab570cb77b542560d7285aec
     */
    let input = `0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000231d51dbec6e3e63ad22078c73b70fbfd1b14265000000000000000000000000e07351ecc2c326400b0ea49f1c45a94ff1b6ada8000000000000000000000000f71b70a4af37a8f8ab570cb77b542560d7285aec`
    const inputBytes = Bytes.fromHexString(input)

    // correct slate is 0xc83dda2479cc098004e11fb2f1872300dd53bdb97e209d9515e52a94b4413026
    const decodedBytes = ethereum.decode("bytes32[]", inputBytes)
    if (decodedBytes) {
        const yays = decodedBytes.toBytesArray()

        // this is equivalent to abi.encodePacked
        const packedYays: Bytes = yays.reduce<Bytes>((previous, current) => previous.concat(current), new Bytes(0))
        const slate = crypto.keccak256(
            ByteArray.fromHexString(packedYays.toHexString())
        )

        assert.bytesEquals(Bytes.fromHexString("0xc83dda2479cc098004e11fb2f1872300dd53bdb97e209d9515e52a94b4413026"), Bytes.fromUint8Array(slate))
    }


    let inputBytes32String = `0xeb8618b3ddd61dc358c4e92673c03f48a46de32858be48ab95d8d25cd0390490`
    const inputBytes32 = Bytes.fromHexString(inputBytes32String)
    const decodedBytes32 = ethereum.decode("bytes32", inputBytes32)
    assert.assertNotNull(decodedBytes32)
    if (decodedBytes32) {
        const slate = decodedBytes32.toBytes()

        assert.bytesEquals(Bytes.fromHexString("0xeb8618b3ddd61dc358c4e92673c03f48a46de32858be48ab95d8d25cd0390490"), Bytes.fromUint8Array(slate))
    }

    // you cannot interpret byte32 string as bytes!
    const decodedBytesNoLength = ethereum.decode("bytes", inputBytes32)
    assert.assertNull(decodedBytesNoLength)
})