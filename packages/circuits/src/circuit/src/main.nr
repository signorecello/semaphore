use dep::std::ec::consts::te::baby_jubjub;
use dep::std::hash::poseidon::bn254;
use dep::std::println;

global LEVELS: Field = 8;

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
        current = bn254::hash_2(pair);
    }
    current
}

fn main(
    // secret: Field,
    identity: Field,
    hash_path: [Field; LEVELS],
    indices: Field,
    // nullifier: pub Field,
    root: pub Field
) {
    // let bjj = baby_jubjub();
    // let pubkey = bjj.curve.mul(secret, bjj.base8);
    // let identity = Poseidon2::hash([pubkey.x, pubkey.y], 2);
    assert(root == compute_merkle_root(identity, indices, hash_path));
    // assert(nullifier == Poseidon2::hash([identity], 1));
}

// #[test]
// fn test() {
//     let t = bn254::hash_2(pair);
//     println(t);
// }
