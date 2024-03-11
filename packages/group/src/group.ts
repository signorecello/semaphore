import { LeanIMT } from "@zk-kit/imt"
import { BarretenbergHelpers } from "@semaphore-protocol/utils/bb"
import { BigNumberish, MerkleProof } from "./types"

/**
 * The Semaphore group is a {@link https://zkkit.pse.dev/classes/_zk_kit_imt.LeanIMT.html | LeanIMT}
 * (Lean Incremental Merkle Tree), i.e. an optimized version of the incremental binary Merkle tree
 * used by Semaphore V3. The new tree does not use zero hashes, and its depth is dynamic.
 * The members of a Semaphore group, or the leaves of a tree, are the identity commitments.
 * Thanks to the properties of Merkle trees, it can be efficiently demonstrated that a group
 * member belongs to the group.
 * This class supports operations such as member addition, update, removal and Merkle proof
 * generation and verification. Groups can also be exported or imported.
 */
export default class Group {
    // The {@link https://zkkit.pse.dev/classes/_zk_kit_imt.LeanIMT.html | LeanIMT} instance.
    public leanIMT: LeanIMT

    /**
     * Creates a new instance of the Group. Optionally, a list of identity commitments can
     * be passed as a parameter. Adding members in chunks is more efficient than adding
     * them one by one with the `addMember` function.
     * @param members A list of identity commitments.
     */
    private constructor(bb: BarretenbergHelpers, members: BigNumberish[] = []) {
        console.log("group hash tests")
        console.log(
            bb.poseidon([
                BigInt("0x0b63a53787021a4a962a452c2921b3663aff1ffd8d5510540f8e659e782956f1"),
                BigInt("0x174db9313255aa8fc098f89a10e757ba664296d2a2f4b7d1e81c040d3a8b953a")
            ])
        )
        const hasher = (a: bigint, b: bigint) => bb.poseidon([a, b])
        this.leanIMT = new LeanIMT(hasher, members.map(BigInt))
    }

    static async new(members: BigNumberish[] = []) {
        const bb = await BarretenbergHelpers.new()
        const group = new Group(bb, members)
        return group
    }

    /**
     * Returns the root hash of the tree.
     * @returns The root hash as a string.
     */
    public get root(): string {
        return this.leanIMT.root ? this.leanIMT.root.toString() : "0"
    }

    /**
     * Returns the depth of the tree.
     * @returns The tree depth as a number.
     */
    public get depth(): number {
        return this.leanIMT.depth
    }

    /**
     * Returns the size of the tree (i.e. number of leaves).
     * @returns The tree size as a number.
     */
    public get size(): number {
        return this.leanIMT.size
    }

    /**
     * Returns the members (i.e. identity commitments) of the group.
     * @returns The list of members of the group.
     */
    public get members(): string[] {
        return this.leanIMT.leaves.map(String)
    }

    /**
     * Returns the index of a member. If the member does not exist it returns -1.
     * @param member A member of the group.
     * @returns The index of the member, or -1 if it does not exist.
     */
    public indexOf(member: BigNumberish): number {
        return this.leanIMT.indexOf(BigInt(member))
    }

    /**
     * Adds a new member to the group.
     * @param member The new member to be added.
     */
    public addMember(member: BigNumberish) {
        this.leanIMT.insert(BigInt(member))
    }

    /**
     * Adds new members to the group.
     * @param members New members.
     */
    public addMembers(members: BigNumberish[]) {
        this.leanIMT.insertMany(members.map(BigInt))
    }

    /**
     * Updates a member in the group.
     * @param index Index of the member to be updated.
     * @param member New member value.
     */
    public updateMember(index: number, member: BigNumberish) {
        this.leanIMT.update(index, BigInt(member))
    }

    /**
     * Removes a member from the group.
     * @param index The index of the member to be removed.
     */
    public removeMember(index: number) {
        this.leanIMT.update(index, BigInt(0))
    }

    /**
     * Creates a proof of membership for a member of the group.
     * @param index The index of the member.
     * @returns The {@link MerkleProof} object.
     */
    public generateMerkleProof(_index: number): MerkleProof {
        const { index, leaf, root, siblings } = this.leanIMT.generateProof(_index)

        return {
            index,
            leaf: leaf.toString(),
            root: root.toString(),
            siblings: siblings.map(String)
        }
    }

    /**
     * Enables the conversion of the group into a JSON string that
     * can be re-used for future imports. This approach is beneficial for
     * large groups, as it avoids re-calculating the tree hashes.
     * @returns The stringified JSON of the group.
     */
    public export(): string {
        return this.leanIMT.export()
    }

    /**
     * Imports an entire group by initializing the tree without calculating
     * any hashes. Note that it is crucial to ensure the integrity of the
     * exported group.
     * @param nodes The stringified JSON of the group.
     * @returns The {@link Group} instance.
     */
    static async import(exportedGroup: string): Promise<Group> {
        const group = await Group.new()

        group.leanIMT.import(exportedGroup)

        return group
    }
}
