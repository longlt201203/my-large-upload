export function findMedian(arr: number[]) {
    const sortedArr = arr.sort();
    const n = sortedArr.length;
    return n % 2 == 0 ? (sortedArr[n/2-1] + sortedArr[n/2])/2 : sortedArr[Math.floor(n/2)];
}

export function calculateMean(arr: number[]) {
    let sum = 0;
    arr.forEach((item) => sum += item);
    return sum/arr.length;
}

export function calculateVariant(arr: number[], mean?: number) {
    mean = mean || calculateMean(arr);
    let sum = 0;
    arr.forEach((item) => {
        sum += (item-mean)*(item-mean);
    })
    return Math.sqrt(sum/arr.length);
}