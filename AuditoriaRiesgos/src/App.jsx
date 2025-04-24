import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Popconfirm, Table, Modal } from 'antd';
import axios from 'axios';

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestEnabled, setSuggestEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newData, setNewData] = useState({
    activo: '',
    riesgo: '',
    impacto: '',
    tratamiento: ''
  });

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    setIsLoading(true);  // Activar el estado de carga al inicio

    axios.post('/analizar-riesgos', { activo: newData.activo })
      .then(response => {
        const { activo, riesgos, impactos } = response.data;
        addNewRows(activo, riesgos, impactos);
        setIsModalVisible(false); // Cerrar el modal
        setIsLoading(false);  // Activar el estado de carga al inicio
        setSuggestEnabled(true)
      })
      .catch(error => {
        console.error('Error al obtener riesgos e impactos:', error);
      });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  const addNewRows = (activo, riesgos, impactos) => {
    const newRows = riesgos.map((riesgo, index) => ({
      key: `${count + index}`,
      activo,
      riesgo,
      impacto: impactos[index],
      tratamiento: '-' // Si es necesario, también puedes manejar esto
    }));
    setDataSource([...dataSource, ...newRows]);
    setCount(count + riesgos.length);
    // Limpiar el formulario después de añadir
    setNewData({
      activo: '',
      riesgo: '',
      impacto: '',
      tratamiento: ''
    });
  };

  const [isRecommending, setIsRecommending] = useState(false);

  // Activar el spinner al inicio y desactivarlo al finalizar
  const handleRecommendTreatment = () => {
    setIsRecommending(true);
    const promises = dataSource.map((row, index) => {
      return axios.post('/sugerir-tratamiento', {
        activo: row.activo,
        riesgo: row.riesgo,
        impacto: row.impacto
      }).then(response => {
        const { tratamiento } = response.data;
        const updatedDataSource = [...dataSource];
        updatedDataSource[index] = {...updatedDataSource[index], tratamiento};
        return updatedDataSource[index];
      });
    });
  
    Promise.all(promises)
      .then(updatedRows => {
        setDataSource(updatedRows);
        setIsRecommending(false);
      })
      .catch(error => {
        console.error('Error al obtener tratamientos:', error);
        setIsRecommending(false);
      });
  };

  const addNewRow = () => {
    setDataSource([...dataSource, { key: count, ...newData }]);
    setCount(count + 1);
    // Clear form data after adding
    setNewData({
      activo: '',
      riesgo: '',
      impacto: '',
      tratamiento: ''
    });
  };
  const [dataSource, setDataSource] = useState([

  ]);

  const [count, setCount] = useState(2);
  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };
  const defaultColumns = [
    {
      title: 'Activo',
      dataIndex: 'activo',
      width: '10%',
      editable: true,
    },
    {
      title: 'Riesgo',
      dataIndex: 'riesgo',
      width: '15%',
      editable: true,
    },
    {
      title: 'Impacto',
      dataIndex: 'impacto',
      width: '45%',
      editable: true,
    },
    {
      title: 'Tratamiento',
      dataIndex: 'tratamiento',
      width: '30%',
      editable: true,
    },
    {
      title: 'Operación',
      dataIndex: 'operation',
      render: (_, record) => (
        dataSource.length >= 1 ? (
          <Popconfirm title="¿Seguro que quieres eliminar?" onConfirm={() => handleDelete(record.key)}>
            <a>Eliminar</a>
          </Popconfirm>
        ) : null
      ),
    },
  ];

  const handleAdd = () => {
    const newData = {
      key: count,
      riesgo: `Nuevo Riesgo ${count}`,
      impacto: `Nuevo Impacto ${count}`,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };
  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });
  return (
    <div>
      <Button onClick={showModal} type="primary" style={{ marginBottom: 16 }}>
        + Agregar activo
      </Button>
      <Button onClick={handleRecommendTreatment} type="primary" loading={isRecommending} disabled={!suggestEnabled} style={{ marginBottom: 16 }}>
        recomendar tratamientos
      </Button>
      <Modal
        title="Agregar nuevo activo"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Agregar"
        cancelText="Cancelar"
        confirmLoading={isLoading}  // Usar confirmLoading para el botón OK del Modal
      >
        <Form layout="vertical">
          <Form.Item label="Activo">
            <Input name="activo" value={newData.activo} onChange={(e) => setNewData({ ...newData, activo: e.target.value })} />
          </Form.Item>
        </Form>
      </Modal>

      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
      />
    </div>
  );
};
export default App;