import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchProjects = async () => {
    const { data } = await api.get(`/projects`);
    const visibleProjects = data.filter(
      (p) =>
        p.creator_id === user.id || (p.collaborators || []).includes(user.id)
    );
    setProjects(visibleProjects);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    const newProject = {
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      creator_id: user.id,
      collaborators: []
    };

    try {
      await api.post("/projects", newProject);
      fetchProjects(); // Atualiza lista
      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      alert("Erro ao criar projeto");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Seus Projetos</h1>
      <button onClick={() => localStorage.clear() || location.reload()}>
        Sair
      </button>

      <h2>Criar novo projeto</h2>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <br />
        <button type="submit">Criar Projeto</button>
      </form>

      <hr />

      <h2>Projetos</h2>
      {projects.length === 0 && <p>Nenhum projeto encontrado</p>}
          <ul>
      {projects.length === 0 && <p>Nenhum projeto encontrado</p>}
      {projects.map((project) => (
        <li key={project.id}>
          <Link to={`/projects/${project.id}`}>
            <h3>{project.name}</h3>
          </Link>
          <p>{project.description}</p>
          <small>
            {project.start_date} até {project.end_date}
          </small>
        </li>
      ))}
    </ul>

    </div>
  );
}
