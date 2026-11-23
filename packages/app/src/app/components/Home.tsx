import type * as React from 'react';
import { useBoardNotifications } from './playground/useBoardNotifications';
import { usePlaygroundBoard } from './playground/usePlaygroundBoard';
import { usePlaygroundMetadata } from './playground/usePlaygroundMetadata';
import { useSimulationPlayback } from './playground/useSimulationPlayback';
import { usePlaygroundRules } from './playground/usePlaygroundRules';
import { useBoardEditing } from './playground/useBoardEditing';
import { useStampEditing } from './playground/useStampEditing';
import { useBoardPersistence } from './playground/useBoardPersistence';
import { useBoardSocial } from './playground/useBoardSocial';
import { useBoardPresentation } from './playground/useBoardPresentation';
import { usePlaygroundShortcuts } from './playground/usePlaygroundShortcuts';
import { useBoardTransitions } from './playground/useBoardTransitions';
import { useBoardDiagnostics } from './playground/useBoardDiagnostics';
import { PlaygroundHeader } from './playground/PlaygroundHeader';
import { PlaygroundInfoPanel } from './playground/PlaygroundInfoPanel';
import { PlaygroundBoard } from './playground/PlaygroundBoard';
import { DiagnosticsPanel } from './playground/DiagnosticsPanel';
import { PlaygroundToast } from './playground/PlaygroundToast';
import { PlaygroundConfirmDialogs } from './playground/PlaygroundConfirmDialogs';
import { BoardNameDialog } from './playground/BoardNameDialog';
import { BoardDetailsDialog } from './playground/BoardDetailsDialog';
import { InsertPatternDialog } from './playground/InsertPatternDialog';
import { BoardPopularityDialog } from './playground/BoardPopularityDialog';

function Home(): React.JSX.Element {
  const notifications = useBoardNotifications();
  const board = usePlaygroundBoard();
  const metadata = usePlaygroundMetadata({ board });
  const playback = useSimulationPlayback({ board, metadata, notifications });
  const ruleActions = usePlaygroundRules({ board, metadata, notifications });
  const social = useBoardSocial({ metadata, notifications });
  const persistence = useBoardPersistence({ board, metadata, social, notifications });
  const presentation = useBoardPresentation({ notifications });
  const editing = useBoardEditing({ board, metadata, playback, presentation, notifications });
  const transitions = useBoardTransitions({ board, metadata, playback, editing, notifications });
  const stamp = useStampEditing({
    board,
    metadata,
    playback,
    editing,
    presentation,
    transitions,
    notifications,
  });
  usePlaygroundShortcuts({ board, playback, editing, stamp, transitions, notifications });
  const diagnostics = useBoardDiagnostics({ board, metadata });
  return (
    <div className="App">
      <PlaygroundHeader
        board={board}
        metadata={metadata}
        persistence={persistence}
        social={social}
        diagnostics={diagnostics}
      />

      <div className="wm-sidebar-layout wm-sidebar-layout-stretch playground-content-row">
        <PlaygroundInfoPanel
          board={board}
          metadata={metadata}
          playback={playback}
          ruleActions={ruleActions}
          persistence={persistence}
          social={social}
          presentation={presentation}
        />

        <PlaygroundBoard
          board={board}
          metadata={metadata}
          playback={playback}
          editing={editing}
          stamp={stamp}
          presentation={presentation}
          transitions={transitions}
        />
        <DiagnosticsPanel
          board={board}
          playback={playback}
          editing={editing}
          stamp={stamp}
          presentation={presentation}
          diagnostics={diagnostics}
        />
      </div>

      <PlaygroundToast notifications={notifications} presentation={presentation} />

      <PlaygroundConfirmDialogs
        metadata={metadata}
        ruleActions={ruleActions}
        social={social}
        transitions={transitions}
      />

      <BoardNameDialog persistence={persistence} />

      <BoardDetailsDialog metadata={metadata} persistence={persistence} />

      <InsertPatternDialog stamp={stamp} presentation={presentation} />

      <BoardPopularityDialog
        metadata={metadata}
        persistence={persistence}
        social={social}
        presentation={presentation}
      />
    </div>
  );
}
export default Home;
