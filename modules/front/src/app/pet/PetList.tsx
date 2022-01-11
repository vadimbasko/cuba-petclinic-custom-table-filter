import * as React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { observable } from "mobx";
import { Modal, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
  collection,
  injectMainStore,
  MainStoreInjected,
  EntityPermAccessControl, DataCollectionStore
} from "@cuba-platform/react-core";
import {ColumnDefinition, DataTable, Spinner} from "@cuba-platform/react-ui";

import { Pet } from "../../cuba/entities/petclinic_Pet";
import {SerializedEntity, getStringId, Condition} from "@cuba-platform/rest";
import { PetManagement } from "./PetManagement";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps
} from "react-intl";
import { Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {FilterDropdownProps} from "antd/es/table/interface";
import {Owner} from "../../cuba/entities/petclinic_Owner";

function OwnerFilterDropdown(props: FilterDropdownProps & {dataCollection: DataCollectionStore<Pet>}) {

  const ownerDC = collection<Owner>(Owner.NAME, {
    view: "_minimal"
  });

  const {setSelectedKeys, selectedKeys, dataCollection} = props;

  const handleSearch = () => {
    const ownerIds: string[] = ownerDC.items
      .filter(owner => owner._instanceName !== undefined
        && owner._instanceName.toLowerCase().indexOf((selectedKeys[0] as string).toLowerCase()) >= 0)
      .filter(owner => owner.id !== undefined)
      .map(owner => owner.id) as string[];

    const condition: Condition = {property: 'owner', operator: 'in', value: ownerIds}
    dataCollection.filter = {conditions: [condition]};
    return dataCollection.load();
  }

  return (
    <div style={{ padding: 8 }}>
      <Input
        value={selectedKeys[0]}
        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => handleSearch()}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => handleSearch()}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Search
        </Button>
      </Space>
    </div>
  )
}

@injectMainStore
@observer
class PetListComponent extends React.Component<
  MainStoreInjected & WrappedComponentProps
> {
  dataCollection = collection<Pet>(Pet.NAME, {
    view: "pet-with-owner-and-type",
    sort: "-updateTs"
  });
  @observable selectedRowKey: string | undefined;

  ownerColumnDefinition: ColumnDefinition<Pet> = {
    field: "owner",
    columnProps: {
      filterDropdown: filterDropdownProps =>
        OwnerFilterDropdown({... filterDropdownProps, dataCollection: this.dataCollection})
    }
  }

  fields: (string | ColumnDefinition<Pet>)[] = [
    "identificationNumber",
    "birthDate",
    "name",
    "type",
    this.ownerColumnDefinition
  ];

  showDeletionDialog = (e: SerializedEntity<Pet>) => {
    Modal.confirm({
      title: this.props.intl.formatMessage(
        { id: "management.browser.delete.areYouSure" },
        { instanceName: e._instanceName }
      ),
      okText: this.props.intl.formatMessage({
        id: "management.browser.delete.ok"
      }),
      cancelText: this.props.intl.formatMessage({ id: "common.cancel" }),
      onOk: () => {
        this.selectedRowKey = undefined;
        return this.dataCollection.delete(e);
      }
    });
  };

  render() {
    if (this.props.mainStore?.isEntityDataLoaded() !== true) return <Spinner />;

    const buttons = [
      <EntityPermAccessControl
        entityName={Pet.NAME}
        operation="create"
        key="create"
      >
        <Link to={PetManagement.PATH + "/" + PetManagement.NEW_SUBPATH}>
          <Button
            htmlType="button"
            style={{ margin: "0 12px 12px 0" }}
            type="primary"
            icon={<PlusOutlined />}
          >
            <span>
              <FormattedMessage id="common.create" />
            </span>
          </Button>
        </Link>
      </EntityPermAccessControl>,
      <EntityPermAccessControl
        entityName={Pet.NAME}
        operation="update"
        key="update"
      >
        <Link to={PetManagement.PATH + "/" + this.selectedRowKey}>
          <Button
            htmlType="button"
            style={{ margin: "0 12px 12px 0" }}
            disabled={!this.selectedRowKey}
            type="default"
          >
            <FormattedMessage id="common.edit" />
          </Button>
        </Link>
      </EntityPermAccessControl>,
      <EntityPermAccessControl
        entityName={Pet.NAME}
        operation="delete"
        key="delete"
      >
        <Button
          htmlType="button"
          style={{ margin: "0 12px 12px 0" }}
          disabled={!this.selectedRowKey}
          onClick={this.deleteSelectedRow}
          type="default"
        >
          <FormattedMessage id="common.remove" />
        </Button>
      </EntityPermAccessControl>
    ];

    return (
      <DataTable
        dataCollection={this.dataCollection}
        columnDefinitions={this.fields}
        onRowSelectionChange={this.handleRowSelectionChange}
        hideSelectionColumn={true}
        buttons={buttons}
      />
    );
  }

  getRecordById(id: string): SerializedEntity<Pet> {
    const record:
      | SerializedEntity<Pet>
      | undefined = this.dataCollection.items.find(
      record => getStringId(record.id!) === id
    );

    if (!record) {
      throw new Error("Cannot find entity with id " + id);
    }

    return record;
  }

  handleRowSelectionChange = (selectedRowKeys: string[]) => {
    this.selectedRowKey = selectedRowKeys[0];
  };

  deleteSelectedRow = () => {
    this.showDeletionDialog(this.getRecordById(this.selectedRowKey!));
  };
}

const PetList = injectIntl(PetListComponent);

export default PetList;
