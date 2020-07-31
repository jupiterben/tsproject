export * from "./mylib"


//test code

function calLessNumber(nums: number[]): number[] {
    return nums.map((item, index) => {
        let result = 0;
        for (let i = index + 1; i < nums.length; i++) {
            if (nums[i] < item) result++;
        }
        return result;
    });
}

let nums = [1,2,3,4];

function calLessNumber2(nums: number[]): number[] {
    let result = new Array(nums.length).fill(0);



    return result;
}
