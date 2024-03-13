import { compile, createFileManager } from "@noir-lang/noir_wasm"
import { join, resolve } from "path"

async function getCircuit(name: string) {
    const basePath = resolve(join("../noir", name))
    const fm = createFileManager(basePath)
    const compiled = await compile(fm, basePath)
    if (!("program" in compiled)) {
        throw new Error("Compilation failed")
    }
    return compiled.program
}
