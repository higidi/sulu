// @flow
import {action} from 'mobx';
import ResourceRequester from '../../../services/ResourceRequester';
import type {ItemEnhancer, LoadOptions} from '../types';
import AbstractLoadingStrategy from './AbstractLoadingStrategy';

export default class PaginatedLoadingStrategy extends AbstractLoadingStrategy {
    load(data: Array<Object>, resourceKey: string, options: LoadOptions, enhanceItem: ItemEnhancer) {
        return ResourceRequester.getList(resourceKey, {...options, limit: 10}).then(action((response) => {
            const responseData = response._embedded[resourceKey];
            data.splice(0, data.length);
            data.push(...responseData.map(enhanceItem));

            return response;
        }));
    }
}
