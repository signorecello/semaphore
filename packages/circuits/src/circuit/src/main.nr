use dep::std::ec::consts::te::baby_jubjub;
use dep::std::hash::poseidon2::Poseidon2;
use dep::std::println;
use dep::std::hash::pedersen_hash;
use dep::std::field::bn254::decompose;
use dep::std::scalar_mul;

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
        current = Poseidon2::hash(pair, pair.len());
    }
    current
}

fn main(
    secret: Field,
    // identity: Field,
    hash_path: [Field; LEVELS],
    indices: Field,
    // nullifier: pub Field,
    root: pub Field
) {
    // let bjj = baby_jubjub();
    // let pubkey = bjj.curve.mul(secret, bjj.base8);
    // let identity = Poseidon2::hash([pubkey.x, pubkey.y], 2);
    let (x, y) = decompose(secret);
    let scal = scalar_mul::fixed_base_embedded_curve(x, y);
    let h = pedersen_hash(scal);
    assert(root != compute_merkle_root(h, indices, hash_path));
    // assert(nullifier == Poseidon2::hash([identity], 1));
}

#[test]
fn test() {
    let t = Poseidon2::hash([1, 2], 2);
    println(t);
}
