// @flow
import React from 'react';
import {computed} from 'mobx';
import {observer} from 'mobx-react';
import type {TreeItem} from '../types';
import ColumnList from '../../../components/ColumnList';
import FullLoadingStrategy from '../loadingStrategies/FullLoadingStrategy';
import TreeStructureStrategy from '../structureStrategies/TreeStructureStrategy';
import AbstractAdapter from './AbstractAdapter';
import columnListAdapterStyles from './columnListAdapter.scss';

@observer
export default class ColumnListAdapter extends AbstractAdapter {
    static LoadingStrategy = FullLoadingStrategy;

    static StructureStrategy = TreeStructureStrategy;

    static icon = 'su-th-list';

    static defaultProps = {
        data: [],
    };

    handleItemClick = (id: string | number) => {
        const {onItemActivation} = this.props;
        if (onItemActivation) {
            onItemActivation(id);
        }
    };

    handleItemSelectionChange = (id: string | number) => {
        const {onItemSelectionChange, selections} = this.props;
        if (onItemSelectionChange) {
            onItemSelectionChange(id, !selections.includes(id));
        }
    };

    handleColumnAdd = (index?: string | number) => {
        if (!index || typeof index !== 'number') {
            return;
        }

        const activeItemPath = this.activeItemPath;
        const {onAddClick} = this.props;

        if (onAddClick && activeItemPath[index - 1]) {
            onAddClick(activeItemPath[index - 1]);
        }
    };

    @computed get activeItemPath(): Array<string | number> {
        const {data} = this.props;
        const tree: Array<TreeItem> = data;

        const activeItemPath = [];

        this.prepareActiveItemPath(activeItemPath, tree);

        return activeItemPath;
    }

    prepareActiveItemPath(activeItemPath: Array<string | number>, tree: Array<TreeItem>) {
        for (let i = 0; i < tree.length; i++) {
            const item = tree[i];
            const {data, children} = item;

            if (data.id === this.props.active) {
                activeItemPath.unshift(data.id);
                return true;
            }

            const activeParent = this.prepareActiveItemPath(activeItemPath, children);

            if (activeParent) {
                activeItemPath.unshift(data.id);
                return true;
            }
        }
    }

    @computed get columnData(): Array<Array<Object>> {
        const {data} = this.props;
        const columns = [];
        const tree = ((data: any): Array<TreeItem>);

        this.prepareColumnLevel(columns, tree);
        this.prepareColumnChildren(columns, tree);

        return columns;
    }

    prepareColumnLevel(columns: Array<Array<Object>>, tree: Array<TreeItem>) {
        for (let i = 0; i < tree.length; i++) {
            const item = tree[i];
            const {data, children} = item;

            if (data.id === this.props.active) {
                this.prepareColumnChildren(columns, children);
                return true;
            }

            const activeParent = this.prepareColumnLevel(columns, children);

            if (activeParent) {
                this.prepareColumnChildren(columns, children);
                return true;
            }
        }
    }

    prepareColumnChildren(columns: Array<Array<Object>>, children: Array<TreeItem>) {
        columns.unshift(children.map((child) => child.data));
    }

    render() {
        const {disabledIds, loading, onAddClick, onItemClick, onItemSelectionChange, selections} = this.props;

        const buttons = [];

        if (onItemClick) {
            buttons.push({
                icon: 'su-pen',
                onClick: onItemClick,
            });
        }

        if (onItemSelectionChange) {
            buttons.push({
                icon: 'su-check',
                onClick: this.handleItemSelectionChange,
            });
        }

        const toolbarItems = [];

        if (onAddClick) {
            toolbarItems.push({
                icon: 'su-plus-circle',
                type: 'button',
                onClick: this.handleColumnAdd,
            });
        }

        return (
            <div className={columnListAdapterStyles.columnListAdapter}>
                <ColumnList buttons={buttons} onItemClick={this.handleItemClick} toolbarItems={toolbarItems}>
                    {this.columnData.map((items, index) => (
                        <ColumnList.Column
                            key={index}
                            loading={index >= this.columnData.length - 1 && loading}
                        >
                            {items.map((item: Object) => (
                                // TODO: Don't access properties like "hasChildren" or "title" directly
                                <ColumnList.Item
                                    active={this.activeItemPath.includes(item.id)}
                                    disabled={disabledIds.includes(item.id)}
                                    hasChildren={item.hasChildren}
                                    id={item.id}
                                    key={item.id}
                                    selected={selections.includes(item.id)}
                                >
                                    {item.title}
                                </ColumnList.Item>
                            ))}
                        </ColumnList.Column>
                    ))}
                </ColumnList>
            </div>
        );
    }
}
