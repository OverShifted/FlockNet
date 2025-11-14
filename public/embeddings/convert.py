import numpy as np
import ml_dtypes
import argparse

parser = argparse.ArgumentParser(
    prog="convert.py",
    description="A dirty script to convert raw animation data into more optimized formats")

parser.add_argument("input", help="input file containing raw data in any builtin numpy float dtype")
parser.add_argument("-o", "--output", help="output file", required=True)
parser.add_argument("-f", "--fp-type", choices=["float32", "float16", "float8_e3m4", "float8_e4m3"], required=True)
parser.add_argument("-d", "--delta-encoding", action="store_true")

args = parser.parse_args()

fp_type = {
    "float32": np.float32,
    "float16": np.float16,
    "float8_e3m4": ml_dtypes.float8_e3m4,
    "float8_e4m3": ml_dtypes.float8_e4m3
}[args.fp_type]

print(f"Converting to {args.fp_type}{'with delta encoding' if args.delta_encoding else ''}")

input_file = open(args.input, 'rb')
output_file = open(args.output, 'wb')

def delta_encode(input_ndarray):
    diff = np.diff(input_ndarray, axis=0)
    return np.concat([np.array([input_ndarray[0]]), diff], axis=0)

while True:
    try:
        input_ndarray = np.array(np.load(input_file))

        if np.issubdtype(input_ndarray.dtype, np.floating):
            output_ndarray = (delta_encode(input_ndarray) 
                              if delta_encode else
                              input_ndarray).astype(fp_type)
        else:
            output_ndarray = input_ndarray

        print("Writing array with type:", output_ndarray.dtype, "and shape:", output_ndarray.shape)
        np.save(output_file, output_ndarray)
    except EOFError:
        break
