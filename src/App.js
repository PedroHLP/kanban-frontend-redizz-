import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Button,
  Badge,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddchartIcon from '@mui/icons-material/Addchart';
import SettingsIcon from '@mui/icons-material/Settings';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState('ToDo');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('https://kanban-app-pcee.onrender.com/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTaskTitle('');
    setTaskDescription('');
    setTaskStatus('ToDo');
  };

  const addTask = async () => {
    if (taskTitle.trim() === '' || taskDescription.trim() === '') {
      alert('Título e Descrição são obrigatórios.');
      return;
    }
    try {
      const response = await axios.post('https://kanban-app-pcee.onrender.com/tasks', {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
      });
      setTasks([...tasks, response.data]);
      handleClose();
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  };

  const updateTask = async (id, updatedStatus) => {
    try {
      const response = await axios.put(`https://kanban-app-pcee.onrender.com/tasks/${id}`, {
        status: updatedStatus,
      });
      setTasks(tasks.map((task) => (task._id === id ? response.data : task)));
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`https://kanban-app-pcee.onrender.com/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    // Se a tarefa foi solta fora de qualquer coluna, não faz nada
    if (!destination) return;

    // Se a tarefa foi solta na mesma posição, não faz nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    // Filtra as tarefas de origem e destino
    const sourceTasks = tasks.filter(task => task.status === sourceStatus);
    const destTasks = tasks.filter(task => task.status === destStatus);

    // Encontra a tarefa que está sendo movida
    const movedTask = sourceTasks[source.index];

    if (!movedTask) return;

    // Atualiza o status da tarefa
    const updatedTask = { ...movedTask, status: destStatus };

    // Atualiza a lista de tarefas localmente
    const updatedTasks = tasks.map(task =>
      task._id === movedTask._id ? updatedTask : task
    );

    setTasks(updatedTasks);

    // Atualiza o status da tarefa no backend
    try {
      await updateTask(movedTask._id, destStatus);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      // Opcional: Reverter o estado local se a atualização falhar
      setTasks(tasks);
    }
  };

  // Lista de itens do sidebar para facilitar a renderização
  const sidebarItems = [
    { label: 'Board', icon: <LeaderboardIcon /> },
    { label: 'Features', icon: <AddchartIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> },
  ];

  // Função para obter a contagem de tarefas por status
  const getTaskCount = (status) => {
    return tasks.filter((task) => task.status === status).length;
  };

  return (
    <Box
      display="flex"
      height="100vh"
      width="100%"
      overflowX="hidden"
      sx={{
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Sidebar Esquerdo - Azul */}
      <Box
        width="80px"
        bgcolor="#0d47a1"
        display="flex"
        flexDirection="column"
        alignItems="center"
        height="100vh"
      >
        {/* Ícone do Jira */}
        <Box
          component="img"
          src="/jira-1.svg"
          alt="Jira Icon"
          sx={{
            width: 40,
            height: 40,
            marginTop: 2,
            marginBottom: 2,
          }}
        />

        {/* Ícone de Buscar */}
        <Tooltip title="Buscar" placement="right">
          <IconButton
            color="inherit"
            aria-label="search"
            sx={{ width: '100%', marginBottom: 2, color: 'white' }}
            onClick={() => {
              // Ação para buscar (a ser implementada)
            }}
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>

        {/* Ícone de Adicionar Tarefa */}
        <Tooltip title="Adicionar Tarefa" placement="right">
          <IconButton
            color="inherit"
            aria-label="add"
            sx={{ width: '100%', color: 'white' }}
            onClick={handleOpen}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Sidebar Direito - Light Grey com Hover */}
      <Box
        width="250px"
        bgcolor="#f1f2f6"
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        height="100vh"
        sx={{ paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        <Box sx={{ marginTop: '2rem', width: '100%', mb: 4 }}>
          {/* Novo Conteúdo: Ícone e Textos */}
          <Box display="flex" alignItems="center" mb={1}>
            <Box
              component="img"
              src="/foguete.jpg" // Caminho para a imagem no diretório public
              alt="Foguete Icon"
              sx={{
                width: 40,
                height: 40,
                marginRight: 1,
              }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Teams in Space
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Software Project
              </Typography>
            </Box>
          </Box>

          {/* Itens de Menu Existentes */}
          {sidebarItems.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                '&:hover': {
                  backgroundColor: '#d5d5d5',
                },
                marginBottom:
                  index !== sidebarItems.length - 1 ? '0.8rem' : '0',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              <IconButton
                sx={{
                  color: '#646464',
                  padding: '0',
                  marginRight: '0.5rem',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {item.icon}
              </IconButton>
              <Typography variant="body1">{item.label}</Typography>
            </Box>
          ))}

          {/* Linha Divisória */}
          <Divider
            sx={{
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              my: 2,
            }}
          />

          {/* Novo Item de Menu: Give Feedback */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: '#d5d5d5',
              },
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            <IconButton
              sx={{
                color: '#646464',
                padding: '0',
                marginRight: '0.5rem',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
              aria-label="give feedback"
            >
              <CampaignIcon />
            </IconButton>
            <Typography variant="body1">Give Feedback</Typography>
          </Box>
        </Box>
      </Box>

      {/* Conteúdo Principal */}
      <Box
        flex={1}
        overflow="hidden"
        display="flex"
        flexDirection="column"
        height="100vh"
        sx={{ boxSizing: 'border-box', margin: 0, padding: 0 }}
      >
        <Typography
          variant="h4"
          align="left"
          sx={{ marginTop: '1rem', marginLeft: '1rem' }}
          gutterBottom
        >
          Board
        </Typography>

        <Box flex={1} overflow="auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box display="flex" gap={2} mt={2} px={2}>
              {['ToDo', 'InProgress', 'Done'].map((status) => {
                const statusLabel =
                  status === 'ToDo'
                    ? 'To Do'
                    : status === 'InProgress'
                    ? 'In Progress'
                    : 'Done';
                const count = getTaskCount(status);

                return (
                  <Droppable droppableId={status} key={status}>
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          flex: 1,
                          padding: 2,
                          backgroundColor:
                            status === 'InProgress'
                              ? snapshot.isDraggingOver
                                ? '#fff4e6'
                                : '#ffe280'
                              : snapshot.isDraggingOver
                              ? '#e3f2fd'
                              : '#fafafa',
                          height: '100%',
                          overflowY: 'auto',
                          maxWidth: '100%',
                          borderRadius: '8px',
                        }}
                      >
                        <Box display="flex" gap={1} alignItems="center" mb={2}>
                          <Typography variant="h6" align="left">
                            {statusLabel}
                          </Typography>
                          <Badge
                            badgeContent={count}
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        {tasks
                          .filter((task) => task.status === status)
                          .map((task, index) => (
                            <Draggable
                              key={task._id}
                              draggableId={task._id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <Paper
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{
                                    padding: 2,
                                    marginBottom: 2,
                                    backgroundColor: snapshot.isDragging
                                      ? '#bbdefb'
                                      : '#ffffff',
                                    cursor: 'pointer',
                                    maxWidth: '100%',
                                    borderRadius: '4px',
                                  }}
                                >
                                  <Typography variant="h6" gutterBottom>
                                    {task.title}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    gutterBottom
                                  >
                                    {task.description}
                                  </Typography>
                                  <Box
                                    display="flex"
                                    justifyContent="flex-end"
                                    mt={1}
                                  >
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="secondary"
                                      onClick={() => deleteTask(task._id)}
                                    >
                                      Deletar
                                    </Button>
                                  </Box>
                                </Paper>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </Paper>
                    )}
                  </Droppable>
                );
              })}
            </Box>
          </DragDropContext>
        </Box>

        {/* Diálogo para Adicionar Nova Tarefa */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={1}>
              <TextField
                label="Título da Tarefa"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                variant="outlined"
                fullWidth
              />
              <TextField
                label="Descrição da Tarefa"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                variant="outlined"
                multiline
                rows={4}
                fullWidth
              />
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="ToDo">To Do</MenuItem>
                  <MenuItem value="InProgress">In Progress</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancelar
            </Button>
            <Button onClick={addTask} color="primary" variant="contained">
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default App;
