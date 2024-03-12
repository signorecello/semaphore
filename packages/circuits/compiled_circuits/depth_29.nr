use dep::std::hash::poseidon;
use dep::std::hash::poseidon::PoseidonHasher;
use dep::std::println;
use dep::std::eddsa::eddsa_to_pub;
use dep::std::ec::consts::te::baby_jubjub;
use dep::std::hash::poseidon2::Poseidon2;

global LEVELS: Field = 29;

fn compute_merkle_root<N>(leaf: Field, indices: Field, hash_path: [Field; N]) -> Field {
    let n = hash_path.len();
    let index_bits = indices.to_be_bits(n as u32);
    let mut current = leaf;
    for i in 0..hash_path.len() {
        let pair : [Field; 2] = if (index_bits[i] == 0) {
            [current, hash_path[i]]
        } else {
            [hash_path[i], current]
        };
        if (hash_path[i] != 0) {
            current = Poseidon2::hash(pair, pair.len());
        };
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
