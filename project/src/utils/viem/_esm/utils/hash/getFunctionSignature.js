import { formatAbiItem } from '../abi/formatAbiItem.js';
import { extractFunctionName, extractFunctionParams, } from '../contract/extractFunctionParts.js';
export const getFunctionSignature = (fn) => {
    if (typeof fn === 'string') {
        const name = extractFunctionName(fn);
        const params = extractFunctionParams(fn) || [];
        return `${name}(${params.map(({ type }) => type).join(',')})`;
    }
    return formatAbiItem(fn);
};
//# sourceMappingURL=getFunctionSignature.js.map