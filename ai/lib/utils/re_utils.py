import re


def find_variables(string):
    pattern = r'\${(.*?)}'
    variables = re.findall(pattern, string)
    return variables
