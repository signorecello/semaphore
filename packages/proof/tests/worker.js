import { parentPort, workerData } from "worker_threads"

const { id } = workerData

function generateMembers() {
    const members = []
    for (let i = 1; i < 2 ** 12 / 8; i += 1) {
        members.push(i) // Or any logic to generate member data
    }
    return members // Return the count of members added
}

parentPort.on("message", (message) => {
    if (message.action === "generate") {
        const members = generateMembers()
        parentPort.postMessage(members)
    }
})
