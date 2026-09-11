import { runReindex } from './reindex';
void runReindex().catch(error=>{console.error(error instanceof Error?error.message:'Re-index failed');process.exitCode=1;});
