import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

export default function Collaborators() {
  const { id } = useParams(); 
  const user = JSON.parse(localStorage.getItem("user"));

  const [project, setProject] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchProject = async () => {
    const { data } = await api.get(`/projects/${id}`);
    setProject(data);
  };

  const fetchUsers = async () => {
    const { data } = await api.get("/users");
    setUsers(data);
  };

  const fetchSuggestions = async () => {
    const res = await fetch("https://randomuser.me/api/?results=3");
    const json = await res.json();
    setSuggestions(json.results);
  };

  const handleAddSuggestion = async (suggestion) => {
    const newUser = {
      name: `${suggestion.name.first} ${suggestion.name.last}`,
      email: suggestion.email,
      password: "123456"
    };

    try {
      const { data } = await api.post("/users", newUser);
      const updated = {
        ...project,
        collaborators: [...(project.collaborators || []), data.id]
      };
      await api.put(`/projects/${id}`, updated);
      fetchProject();
      alert("Colaborador adicionado com sucesso!");
    } catch (err) {
      alert("Erro ao adicionar colaborador");
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm("Remover colaborador?")) return;

    const updated = {
      ...project,
      collaborators: project.collaborators.filter((id) => id !== userId)
    };

    try {
      await api.put(`/projects/${id}`, updated);
      fetchProject();
    } catch (err) {
      alert("Erro ao remover colaborador");
    }
  };

  useEffect(() => {
    fetchProject();
    fetchUsers();
    fetchSuggestions();
  }, []);

  if (!project) return <p>Carregando...</p>;

  if (project.creator_id !== user.id) {
    return <p>Acesso negado. Apenas o criador pode gerenciar colaboradores.</p>;
  }

  const collaboratorList = users.filter((u) =>
    project.collaborators?.includes(u.id)
  );

  return (
    <div style={{ padding: 40 }}>
      <h2>Colaboradores do Projeto</h2>
      <ul>
        {collaboratorList.map((colab) => (
          <li key={colab.id}>
            {colab.name} ({colab.email})
            <button onClick={() => handleRemove(colab.id)}>Remover</button>
          </li>
        ))}
      </ul>

      <h3>Sugestões para adicionar</h3>
      <ul>
        {suggestions.map((sug, index) => (
          <li key={index}>
            {sug.name.first} {sug.name.last} ({sug.email}){" "}
            <button onClick={() => handleAddSuggestion(sug)}>Adicionar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
