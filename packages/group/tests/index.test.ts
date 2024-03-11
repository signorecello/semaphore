import { Group } from "../src"

describe("Group", () => {
    describe("# Group", () => {
        it("Should create a group", async () => {
            const group = await Group.new()

            expect(group.root).toBe("0")
            expect(group.depth).toBe(0)
            expect(group.size).toBe(0)
        })

        it("Should create a group with a list of members", async () => {
            const group = await Group.new([1, 2, 3])

            const group2 = await Group.new()

            group2.addMember(1)
            group2.addMember(2)
            group2.addMember(3)

            expect(group.root).toContain(group2.root)
            expect(group.depth).toBe(2)
            expect(group.size).toBe(3)
        })
    })

    describe("# addMember", () => {
        it("Should add a member to a group", async () => {
            const group = await Group.new()

            group.addMember(3)

            expect(group.size).toBe(1)
        })
    })

    describe("# addMembers", () => {
        it("Should add many members to a group", async () => {
            const group = await Group.new()

            group.addMembers([1, 3])

            expect(group.size).toBe(2)
        })
    })

    describe("# indexOf", () => {
        it("Should return the index of a member in a group", async () => {
            const group = await Group.new()
            group.addMembers([1, 3])

            const index = group.indexOf(3)

            expect(index).toBe(1)
        })
    })

    describe("# updateMember", () => {
        it("Should update a member in a group", async () => {
            const group = await Group.new()
            group.addMembers([1, 3])

            group.updateMember(0, 1)

            expect(group.size).toBe(2)
            expect(group.members[0]).toBe("1")
        })
    })

    describe("# removeMember", () => {
        it("Should remove a member from a group", async () => {
            const group = await Group.new()
            group.addMembers([1, 3])

            group.removeMember(0)

            expect(group.size).toBe(2)
            expect(group.members[0]).toBe("0")
        })
    })

    describe("# generateMerkleProof", () => {
        it("Should generate a proof of membership", async () => {
            const group = await Group.new()
            group.addMembers([1, 3])

            const proof = group.generateMerkleProof(0)

            expect(proof.leaf).toBe("1")
        })
    })

    describe("# export", () => {
        it("Should export a group", async () => {
            const group = await Group.new([1, 2, 3])

            const exportedGroup = group.export()

            expect(typeof exportedGroup).toBe("string")
            expect(JSON.parse(exportedGroup)).toHaveLength(3)
            expect(JSON.parse(exportedGroup)[0]).toHaveLength(3)
        })
    })

    // describe("# import", () => {
    //     it("Should import a group", async () => {
    //         const group1 = await Group.new([1, 2, 3])
    //         const exportedGroup = group1.export()

    //         const group2 = await Group.import(exportedGroup)

    //         group1.addMember(4)
    //         group2.addMember(4)

    //         expect(group2.depth).toBe(group1.depth)
    //         expect(group2.size).toBe(group1.size)
    //         expect(group2.root).toBe(group1.root)
    //     })
    // })
})
