import { compile, createFileManager } from "@noir-lang/noir_wasm"
import { cp, mkdir, readFile, rmdir, writeFile } from "fs/promises"
import { join, resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, "..")

async function getCircuit(depth) {
    const circuitsDir = resolve(projectRoot, "src/circuit")

    const compiledCircuitsDir = resolve(projectRoot, "compiled_circuits")
    await mkdir(compiledCircuitsDir, { recursive: true })
    const tempDir = resolve(projectRoot, "temp")
    await mkdir(tempDir, { recursive: true })

    await cp(circuitsDir, tempDir, { recursive: true })

    for (let i = 0; i <= depth; i++) {
        const file = await readFile(resolve(join(tempDir, "src/main.nr")), "utf-8")
        const newContent = file.replace(/global LEVELS: Field = [0-9]+;/, `global LEVELS: Field = ${i};`)
        await writeFile(resolve(join(tempDir, "src/main.nr")), newContent)

        const fm = createFileManager(tempDir)
        const compiled = await compile(fm, tempDir)
        if (!("program" in compiled)) {
            throw new Error("Compilation failed")
        }
        const data = JSON.stringify(compiled)
        await writeFile(resolve(projectRoot, "compiled_circuits/depth_" + i + ".json"), data)
    }
    await rmdir(tempDir, { recursive: true })
}

await getCircuit(process.argv[2])
