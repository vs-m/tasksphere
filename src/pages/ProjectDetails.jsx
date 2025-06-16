import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

export default function ProjectDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  };

  const fetchProject = async () => {
    const { data } = await api.get(`/projects/${id}`);
    setProject(data);
  };

  const fetchTasks = async () => {
    const { data } = await api.get(`/tasks?project_id=${id}`);
    setTasks(data);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!title || !dueDate || !imageUrl) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    const taskData = {
      title,
      status,
      due_date: dueDate,
      image_url: imageUrl,
      project_id: Number(id),
      creator_id: editingTask ? editingTask.creator_id : user.id,
    };

    try {
      setLoading(true);
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskData);
        showFeedback("Tarefa atualizada com sucesso!");
        setEditingTask(null);
      } else {
        await api.post("/tasks", taskData);
        showFeedback("Tarefa criada com sucesso!");
      }
      fetchTasks();
      setTitle("");
      setStatus("todo");
      setDueDate("");
      setImageUrl("");
    } catch {
      alert("Erro ao salvar tarefa");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setStatus(task.status);
    setDueDate(task.due_date);
    setImageUrl(task.image_url);
  };

  const handleDelete = async (taskId) => {
    if (confirm("Deseja mesmo excluir?")) {
      try {
        setLoading(true);
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
        showFeedback("Tarefa excluída.");
      } catch {
        alert("Erro ao excluir tarefa");
      } finally {
        setLoading(false);
      }
    }
  };

  const canEditOrDelete = (task) => {
    return task.creator_id === user.id || project?.creator_id === user.id;
  };

  const filteredTasks = tasks.filter((task) => {
    const matchTitle = task.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || task.status === statusFilter;
    return matchTitle && matchStatus;
  });

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  if (!project) return <p>Carregando projeto...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      <small>{project.start_date} até {project.end_date}</small>

      {project.creator_id === user.id && (
        <button
          onClick={() => (window.location.href = `/projects/${id}/collaborators`)}
        >
          Gerenciar Colaboradores
        </button>
      )}

      {feedback && <p style={{ color: "green" }}>{feedback}</p>}
      {loading && <p>Carregando...</p>}

      <hr />

      <h3>{editingTask ? "Editar Tarefa" : "Criar Nova Tarefa"}</h3>
      <form onSubmit={handleCreateOrUpdate}>
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todo">A Fazer</option>
          <option value="in_progress">Em Progresso</option>
          <option value="done">Concluída</option>
        </select>
        <br />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <br />
        <input
          type="url"
          placeholder="URL da imagem"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <br />
        <button type="submit" disabled={loading}>
          {editingTask ? "Salvar Alterações" : "Criar Tarefa"}
        </button>
        {editingTask && (
          <button onClick={() => setEditingTask(null)} type="button">
            Cancelar Edição
          </button>
        )}
      </form>

      <hr />

      <h2>Tarefas</h2>
      <input
        type="text"
        placeholder="Buscar por título"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="all">Todos</option>
        <option value="todo">A Fazer</option>
        <option value="in_progress">Em Progresso</option>
        <option value="done">Concluída</option>
      </select>

      <ul>
        {filteredTasks.length === 0 && <p>Nenhuma tarefa encontrada</p>}
        {filteredTasks.map((task) => (
          <li key={task.id}>
            <h4>{task.title}</h4>
            <p>Status: {task.status}</p>
            <img src={task.image_url} alt={task.title} width="100" />
            <p>Vence em: {task.due_date}</p>
            {canEditOrDelete(task) && (
              <>
                <button onClick={() => handleEdit(task)}>Editar</button>
                <button onClick={() => handleDelete(task.id)}>Excluir</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
