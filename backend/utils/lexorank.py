def _get_lexorank_midpoint(prev: str, next_rank: str, min_char: str = 'a', max_char: str = 'z') -> str:
    """
    Returns a lexicographic midpoint string between prev and next_rank.
    Strings use characters in [min_char, max_char].
    """
    MIN = ord(min_char)
    MAX = ord(max_char)
    RANGE = MAX - MIN + 1

    def to_digits(s: str) -> list[int]:
        return [ord(c) - MIN for c in s]

    def from_digits(digits: list[int]) -> str:
        return ''.join(chr(d + MIN) for d in digits)

    if not prev and not next_rank:
        return 'm' * 6
    if not prev:
        if next_rank == min_char:
            return min_char + ('m' * 6)
        prev = min_char
    if not next_rank:
        next_rank = max_char * (len(prev) + 1)

    max_len = max(len(prev), len(next_rank))
    
    p_string = prev.ljust(max_len, min_char)
    n_string = next_rank.ljust(max_len, min_char)

    p_digits = to_digits(p_string)
    n_digits = to_digits(n_string)

    def to_int(digits: list[int]) -> int:
        result = 0
        for d in digits:
            result = result * RANGE + d
        return result

    def from_int(value: int, length: int) -> list[int]:
        digits = []
        for _ in range(length):
            digits.append(value % RANGE)
            value //= RANGE
        digits.reverse()
        return digits

    p_int = to_int(p_digits)
    n_int = to_int(n_digits)

    if n_int - p_int > 1:
        mid_int = (p_int + n_int) // 2
        
        res = from_digits(from_int(mid_int, max_len)).rstrip(min_char)
        if not res:
            res = min_char
        return res

    p_digits.append(0)
    n_digits.append(RANGE - 1)
    mid_int = (to_int(p_digits) + to_int(n_digits)) // 2
    res = from_digits(from_int(mid_int, max_len + 1)).rstrip(min_char)
    if not res:
        res = min_char
    return res
