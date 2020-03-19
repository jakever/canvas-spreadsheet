const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; //0 = A, 25 = Z

export const iToA = (i) => {
  let current = i;

  let a = "";

  while(current > -1) {
    let digit = current % 26;
    a = alpha[digit] + "" + a;

    //This is not a straight number base conversion, we need to
    //treat A as
    current = Math.floor(current / 26) - 1;
  }

  return a;
}

export const aToI = (a) => {
  let index = (alpha.indexOf(a[0]) + 1) * Math.pow(26, a.length - 1) - 1;

  for(let i = a.length - 1; i > 0; i--) {
    index += (alpha.indexOf(a[i]) + 1) * Math.pow(26, a.length - i - 1);
  }

  return index;
};
