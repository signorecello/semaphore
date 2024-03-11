use dep::std::hash::poseidon;
use dep::std::hash::poseidon::PoseidonHasher;
use dep::std::println;
use dep::std::eddsa::eddsa_to_pub;
use dep::std::ec::consts::te::baby_jubjub;
use dep::std::hash::poseidon2::Poseidon2;

global LEVELS: Field = 10;

fn compute_merkle_root<N>(leaf: Field, indices: Field, hash_path: [Field; N]) -> Field {
    let n = hash_path.len();
    let index_bits = indices.to_be_bits(n as u32);
    let mut current = leaf;
    for i in 0..hash_path.len() {
        println("----------");
        println("index");
        println(index_bits[i]);

        // if the path bit is 0, we are on the left
        // so we hash with the hash_path as (current, hash_path[i])
        // otherwise we hash with the hash_path as (hash_path[i], current)
        let pair : [Field; 2] = if (index_bits[i] == 0) {
            [current, hash_path[i]]
        } else {
            [hash_path[i], current]
        };
        println("left");
        println(pair[0]);
        println("right");
        println(pair[1]);
        // we only hash if there is any sibling, otherwise we just promote it
        if (index_bits[i] != 0) {
            current = Poseidon2::hash(pair, pair.len());
        };
        println("current");
        println(current);
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
    println(pubkey.x);
    println(pubkey.y);
    let identity = Poseidon2::hash([pubkey.x, pubkey.y], 2);
    println(identity);

    assert(root == compute_merkle_root(identity, indices, hash_path));

    assert(nullifier == Poseidon2::hash([secret], 1));
}
