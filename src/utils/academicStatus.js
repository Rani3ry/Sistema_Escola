export function hasLaunchedValue(value) {
  return value !== null && value !== undefined && value !== '';
}

export function calculateAcademicStatus(registro) {
  if (!registro) return 'SEM STATUS';

  const nota01 = registro.nota01;
  const nota02 = registro.nota02;
  const nota03 = registro.nota03;
  const faltas = registro.faltas ?? 0;

  const temNota01 = hasLaunchedValue(nota01);
  const temNota02 = hasLaunchedValue(nota02);
  const temNota03 = hasLaunchedValue(nota03);

  if (faltas > 10) return 'REPROVADO';
  if (!temNota01 && !temNota02 && !temNota03) return 'SEM STATUS';
  if (!temNota01 || !temNota02) return 'SEM STATUS';

  const mediaParcial = (Number(nota01) + Number(nota02)) / 2;

  if (mediaParcial >= 6) return 'APROVADO';
  if (!temNota03) return 'EM RECUPERACAO';

  return mediaParcial + Number(nota03) >= 5 ? 'APROVADO NA RECUPERACAO' : 'REPROVADO';
}
