use dep::std::ec::consts::te::baby_jubjub;
use dep::std::hash::poseidon2::Poseidon2;
use dep::std::println;

global LEVELS: Field = 32;


fn compute_merkle_root<N>(leaf: Field, indices: Field, hash_path: [Field; N]) -> Field {
    let n = hash_path.len();
    let index_bits = indices.to_be_bits(n as u32);
    let mut current = leaf;
    for i in 0..hash_path.len() {
        // println("...");
        // println(index_bits[i]);
        let pair : [Field; 2] = if (index_bits[i] == 0) {
            [current, hash_path[i]]
        } else {
            [hash_path[i], current]
        };
        // println(pair[0]);
        // println(pair[1]);
        // if (hash_path[i] != 0) {
            println("hashing");
            println(i);
            current = Poseidon2::hash(pair, pair.len());
        // };
        // println(current);

    }
    current
}

fn main(
    secret: Field,
    hash_path: [Field; LEVELS],
    indices: Field,
    nullifier: pub Field,
    root: pub Field,
) {
    let bjj = baby_jubjub();
    let pubkey = bjj.curve.mul(secret, bjj.base8);
    let identity = Poseidon2::hash([pubkey.x, pubkey.y], 2);
    assert(root == compute_merkle_root(identity, indices, hash_path));
    assert(nullifier == Poseidon2::hash([secret], 1));
}

#[test]
fn test() {
    let t = Poseidon2::hash([1, 2], 2);
    println(t);
}
