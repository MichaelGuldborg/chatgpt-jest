export const sortByKey = <T>(list: T[] | undefined | null, key: keyof T) => {
    return list?.sort((a, b) => `${a[key]}`.localeCompare(`${b[key]}`)) ?? [];
};

export default sortByKey;
