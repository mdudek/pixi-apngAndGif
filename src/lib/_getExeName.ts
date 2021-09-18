export function $getExeName(filePath: string) {
    let aList = filePath.split('.');
    return aList[aList.length - 1];
}
