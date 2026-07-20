import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import NightBackground from '../src/components/NightBackground';
import PrimaryButton from '../src/components/PrimaryButton';
import { completeInitialAccountSetup } from '../src/backend/accountSetup';
import { useAccountSetup } from '../src/backend/AccountSetupProvider';
import {
  addManualIdentityObject, addProviderMusic, advanceIdentityStage, completeIdentityOnboarding,
  getIdentityState, reorderIdentityShelf, searchMusic, setSocialIntentions, updateIdentityObject,
  type IdentityState, type MusicCandidate,
} from '../src/backend/identityOnboarding';
import { saveOnboardingProgress } from '../src/backend/onboarding';
import { removeShelfItem, type ShelfItem } from '../src/backend/taste';
import { font, ink, layout, moon, surface } from '../src/theme';

type Stage = 'account' | 'social' | 'music' | 'meaning' | 'privacy';
const baseCompleted = ['account', 'age_confirmation', 'display_identity'];

export default function IdentityOnboarding() {
  const router = useRouter();
  const { markComplete } = useAccountSetup();
  const [identity, setIdentity] = useState<IdentityState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try { setIdentity(await getIdentityState()); }
    catch { setError('Your private onboarding could not be loaded.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const stage = useMemo<Stage>(() => {
    if (!identity?.hasAccount) return 'account';
    const current = identity.progress?.currentStep;
    if (current === 'music_selection') return 'music';
    if (current === 'emotional_prompts' || current === 'additional_taste') return 'meaning';
    if (current === 'privacy_settings' || current === 'archetype_assessment' || current === 'safety_agreement') return 'privacy';
    return 'social';
  }, [identity]);

  if (loading) return <Screen><ActivityIndicator color={moon.present} /></Screen>;
  if (!identity) return <Screen><Text accessibilityRole="alert" style={styles.error}>{error ?? 'Onboarding is unavailable.'}</Text><PrimaryButton label="try again" onPress={() => void load()} /></Screen>;
  const draftName = identity.progress?.draftData && typeof identity.progress.draftData === 'object' && !Array.isArray(identity.progress.draftData)
    ? identity.progress.draftData.displayName : undefined;
  if (stage === 'account') return <AccountStage initialName={typeof draftName === 'string' ? draftName : ''} onDone={load} />;
  if (stage === 'social') return <SocialStage identity={identity} setIdentity={setIdentity} onDone={load} />;
  if (stage === 'music') return <MusicStage identity={identity} onDone={load} />;
  if (stage === 'meaning') return <MeaningStage identity={identity} setIdentity={setIdentity} onDone={load} />;
  return <PrivacyStage identity={identity} setIdentity={setIdentity} onDone={async () => { await completeIdentityOnboarding(); markComplete(); router.replace('/'); }} />;
}

function Screen({ children }: { children: React.ReactNode }) {
  return <View style={styles.root}><NightBackground /><SafeAreaView style={styles.screen}><KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled"><View style={styles.column}>{children}</View></ScrollView></KeyboardAvoidingView></SafeAreaView></View>;
}

function Heading({ step, title, body }: { step: string; title: string; body: string }) {
  return <><Text style={styles.step}>{step}</Text><Text style={styles.title}>{title}</Text><Text style={styles.sub}>{body}</Text></>;
}

function AccountStage({ initialName, onDone }: { initialName: string; onDone: () => Promise<void> }) {
  const [name, setName] = useState(initialName); const [age, setAge] = useState(false); const [terms, setTerms] = useState(false); const [privacy, setPrivacy] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const ready = name.trim().length >= 2 && age && terms && privacy && !busy;
  const saveDraft = async () => { if (name.trim().length >= 2) await saveOnboardingProgress({ currentStep: 'display_identity', completedSteps: ['account', 'age_confirmation'], draftData: { displayName: name.trim() }, completedAt: null }).catch(() => undefined); };
  const finish = async () => { if (!ready) return; setBusy(true); setError(null); try { await completeInitialAccountSetup({ anonymousName: name, ageConfirmed: age, termsAccepted: terms, privacyAccepted: privacy }); await onDone(); } catch { setError('Private account setup could not be completed.'); } finally { setBusy(false); } };
  return <Screen><Heading step="1 OF 5 · PRIVATE ACCOUNT" title="a name for this space." body="Your profile starts private. Discovery stays off." /><Card style={styles.card}><TextInput value={name} onChangeText={setName} onBlur={() => void saveDraft()} style={styles.input} placeholder="display name" placeholderTextColor={ink.low} maxLength={40} /><Check checked={age} onPress={() => setAge(!age)} label="I confirm I am 18 or older." /><Check checked={terms} onPress={() => setTerms(!terms)} label="I agree to the terms." /><Check checked={privacy} onPress={() => setPrivacy(!privacy)} label="I accept the privacy notice." />{error ? <Text style={styles.error}>{error}</Text> : null}<View style={styles.action}><PrimaryButton block disabled={!ready} onPress={finish} label={busy ? 'saving…' : 'continue privately'} /></View></Card></Screen>;
}

function SocialStage({ identity, setIdentity, onDone }: { identity: IdentityState; setIdentity: (value: IdentityState) => void; onDone: () => Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const toggle = async (id: string) => {
    const next = identity.selectedIntentionIds.includes(id) ? identity.selectedIntentionIds.filter((value) => value !== id) : [...identity.selectedIntentionIds, id];
    setIdentity({ ...identity, selectedIntentionIds: next });
    try { await setSocialIntentions(next); } catch { setIdentity(identity); setError('That choice could not be saved.'); }
  };
  const next = async () => { if (!identity.selectedIntentionIds.length) return; setBusy(true); try { await advanceIdentityStage('music_selection', [...baseCompleted, 'social_intention']); await onDone(); } catch { setError('Your progress could not be saved.'); } finally { setBusy(false); } };
  return <Screen><Heading step="2 OF 5 · SOCIAL INTENTION" title="why are you here?" body="Choose every answer that feels true. You can change these later." /><View style={styles.options}>{identity.intentions.map((item) => <Choice key={item.id} selected={identity.selectedIntentionIds.includes(item.id)} onPress={() => void toggle(item.id)} label={item.label} />)}</View>{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton block disabled={!identity.selectedIntentionIds.length || busy} onPress={next} label="build my music identity" /></Screen>;
}

function MusicStage({ identity, onDone }: { identity: IdentityState; onDone: () => Promise<void> }) {
  const [query, setQuery] = useState(''); const [results, setResults] = useState<MusicCandidate[]>([]); const [searching, setSearching] = useState(false); const [error, setError] = useState<string | null>(null); const [manualType, setManualType] = useState<'artist' | 'song' | 'album'>('artist'); const [manualTitle, setManualTitle] = useState(''); const [manualCreator, setManualCreator] = useState('');
  const artists = identity.shelf.filter((item) => item.objectType === 'artist').length; const songs = identity.shelf.filter((item) => item.objectType === 'song').length;
  const runSearch = async () => { if (query.trim().length < 2) return; setSearching(true); setError(null); try { setResults(await searchMusic(query)); } catch { setResults([]); setError('Provider search is unavailable. Manual fallback remains available.'); } finally { setSearching(false); } };
  const addProvider = async (item: MusicCandidate) => { try { await addProviderMusic(item, item.objectType === 'artist' ? ['favourite_artist'] : item.objectType === 'song' ? ['favourite_song'] : ['favourite_album']); await onDone(); } catch { setError('That object is already selected or could not be saved.'); } };
  const addManual = async () => { if (!manualTitle.trim()) return; try { await addManualIdentityObject({ objectType: manualType, title: manualTitle, creatorName: manualCreator, identityRoles: manualType === 'artist' ? ['favourite_artist'] : manualType === 'song' ? ['favourite_song'] : ['favourite_album'] }); setManualTitle(''); setManualCreator(''); await onDone(); } catch { setError('That manual object is already selected or invalid.'); } };
  const remove = async (id: string) => { try { await removeShelfItem(id); await onDone(); } catch { setError('That object could not be removed.'); } };
  const move = async (index: number, direction: -1 | 1) => { const target = index + direction; if (target < 0 || target >= identity.shelf.length) return; const ordered = [...identity.shelf]; [ordered[index], ordered[target]] = [ordered[target], ordered[index]]; try { await reorderIdentityShelf(ordered.map((item) => item.id)); await onDone(); } catch { setError('That order could not be saved.'); } };
  const next = async () => { if (artists < 5 || songs < 5) return; await advanceIdentityStage('emotional_prompts', [...baseCompleted, 'social_intention', 'music_selection']); await onDone(); };
  return <Screen><Heading step="3 OF 5 · MUSIC IDENTITY" title="what stays with you?" body={`Artists ${artists}/5 · Songs ${songs}/5. Search uses a real server-side provider; manual entry is always available.`} />{identity.shelf.length ? <Card style={styles.card}><Text style={styles.label}>YOUR SELECTION · SAVED</Text>{identity.shelf.map((item, index) => <View key={item.id} style={styles.result}><View style={styles.flex}><Text style={styles.resultTitle}>{item.title}</Text><Text style={styles.meta}>{item.objectType}{item.creatorName ? ` · ${item.creatorName}` : ''}</Text></View><Pressable accessibilityLabel="move earlier" disabled={index === 0} onPress={() => void move(index, -1)} style={styles.smallAction}><Text style={styles.smallActionLabel}>↑</Text></Pressable><Pressable accessibilityLabel="move later" disabled={index === identity.shelf.length - 1} onPress={() => void move(index, 1)} style={styles.smallAction}><Text style={styles.smallActionLabel}>↓</Text></Pressable><Pressable accessibilityLabel={`remove ${item.title}`} onPress={() => void remove(item.id)} style={styles.smallAction}><Text style={styles.removeLabel}>×</Text></Pressable></View>)}</Card> : null}<Card style={styles.card}><View style={styles.row}><TextInput value={query} onChangeText={setQuery} style={[styles.input, styles.flex]} placeholder="search artists, songs, albums" placeholderTextColor={ink.low} /><Pressable onPress={() => void runSearch()} style={styles.textButton}><Text style={styles.textButtonLabel}>{searching ? 'searching…' : 'search'}</Text></Pressable></View>{results.slice(0, 12).map((item) => <Pressable key={item.providerObjectId} onPress={() => void addProvider(item)} style={styles.result}><View style={styles.flex}><Text style={styles.resultTitle}>{item.title}</Text><Text style={styles.meta}>{item.objectType}{item.creatorName ? ` · ${item.creatorName}` : ''}</Text></View><Text style={styles.plus}>+</Text></Pressable>)}</Card><Card style={styles.card}><Text style={styles.label}>MANUAL FALLBACK</Text><View style={styles.pills}>{(['artist','song','album'] as const).map((type) => <Choice key={type} compact label={type} selected={manualType === type} onPress={() => setManualType(type)} />)}</View><TextInput value={manualTitle} onChangeText={setManualTitle} style={styles.input} placeholder="title" placeholderTextColor={ink.low} /><TextInput value={manualCreator} onChangeText={setManualCreator} style={styles.input} placeholder="artist, optional" placeholderTextColor={ink.low} /><Pressable onPress={() => void addManual()} style={styles.textButton}><Text style={styles.textButtonLabel}>add privately</Text></Pressable></Card>{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton block disabled={artists < 5 || songs < 5} onPress={next} label="add what it means" /></Screen>;
}

function MeaningStage({ identity, setIdentity, onDone }: { identity: IdentityState; setIdentity: (value: IdentityState) => void; onDone: () => Promise<void> }) {
  const [notes, setNotes] = useState<Record<string, string>>(Object.fromEntries(identity.shelf.map((item) => [item.id, item.personalNote ?? '']))); const [error, setError] = useState<string | null>(null); const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => () => { Object.values(noteTimers.current).forEach(clearTimeout); }, []);
  const songs = identity.shelf.filter((item) => item.objectType === 'song'); const hasRole = (role: string) => songs.some((item) => item.identityRoles.includes(role));
  const saveNote = async (item: ShelfItem) => { try { await updateIdentityObject(item.id, { personalNote: notes[item.id]?.trim() || null }); } catch { setError('A note could not be saved.'); } };
  const changeNote = (item: ShelfItem, value: string) => {
    setNotes((current) => ({ ...current, [item.id]: value }));
    clearTimeout(noteTimers.current[item.id]);
    noteTimers.current[item.id] = setTimeout(() => {
      updateIdentityObject(item.id, { personalNote: value.trim() || null }).catch(() => setError('A note could not be saved.'));
    }, 500);
  };
  const toggleRole = async (item: ShelfItem, role: string) => { const roles = item.identityRoles.includes(role) ? item.identityRoles.filter((value) => value !== role) : [...item.identityRoles, role]; try { await updateIdentityObject(item.id, { identityRoles: roles }); setIdentity({ ...identity, shelf: identity.shelf.map((value) => value.id === item.id ? { ...value, identityRoles: roles } : value) }); } catch { setError('That meaning could not be saved.'); } };
  const ready = hasRole('current_song') && hasRole('comfort_song') && hasRole('feels_like_me') && Object.values(notes).some((note) => note.trim());
  const next = async () => { if (!ready) return; try { await Promise.all(identity.shelf.map((item) => updateIdentityObject(item.id, { personalNote: notes[item.id]?.trim() || null }))); await advanceIdentityStage('privacy_settings', [...baseCompleted, 'social_intention', 'music_selection', 'emotional_prompts']); await onDone(); } catch { setError('Your meaning could not be saved.'); } };
  return <Screen><Heading step="4 OF 5 · MEANING" title="more than favourites." body="Add meaning to at least one object, then mark a current song, a comfort song, and one that feels like you." />{identity.shelf.map((item) => <Card key={item.id} style={styles.objectCard}><Text style={styles.meta}>{item.objectType.toUpperCase()}</Text><Text style={styles.objectTitle}>{item.title}</Text><TextInput value={notes[item.id] ?? ''} onChangeText={(value) => changeNote(item, value)} onBlur={() => void saveNote(item)} style={[styles.input, styles.noteInput]} multiline placeholder="Why did this stay with you?" placeholderTextColor={ink.low} />{item.objectType === 'song' ? <View style={styles.pills}>{[['current_song','current'],['comfort_song','comfort'],['feels_like_me','feels like me']].map(([role,label]) => <Choice compact key={role} label={label} selected={item.identityRoles.includes(role)} onPress={() => void toggleRole(item, role)} />)}</View> : null}</Card>)}{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton block disabled={!ready} onPress={next} label="review privacy" /></Screen>;
}

function PrivacyStage({ identity, setIdentity, onDone }: { identity: IdentityState; setIdentity: (value: IdentityState) => void; onDone: () => Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const patchItem = async (item: ShelfItem, patch: Partial<ShelfItem>) => { const next = { ...item, ...patch }; setIdentity({ ...identity, shelf: identity.shelf.map((value) => value.id === item.id ? next : value) }); try { await updateIdentityObject(item.id, { visibility: next.visibility, useForMatching: next.useForMatching }); } catch { setIdentity(identity); setError('A privacy choice could not be saved.'); } };
  const finish = async () => { setBusy(true); setError(null); try { const reviewedAt = new Date().toISOString(); await Promise.all(identity.shelf.map((item) => updateIdentityObject(item.id, { visibility: item.visibility, useForMatching: item.useForMatching, privacyReviewedAt: reviewedAt }))); await onDone(); } catch { setError('The server could not complete this profile. Check every required music and meaning choice.'); } finally { setBusy(false); } };
  return <Screen><Heading step="5 OF 5 · PRIVACY REVIEW" title="you decide what travels." body="Your profile remains private and discovery stays off. These choices are stored now for any future opt-in." />{identity.shelf.map((item) => <Card key={item.id} style={styles.objectCard}><Text style={styles.objectTitle}>{item.title}</Text><Text style={styles.meta}>{item.personalNote ? 'Has personal meaning · ' : ''}{item.visibility} · {item.useForMatching ? 'may influence matching' : 'excluded from matching'}</Text><View style={styles.pills}><Choice compact label="private" selected={item.visibility === 'private'} onPress={() => void patchItem(item, { visibility: 'private' })} /><Choice compact label="profile later" selected={item.visibility === 'profile'} onPress={() => void patchItem(item, { visibility: 'profile' })} /><Choice compact label="use for matching" selected={item.useForMatching} onPress={() => void patchItem(item, { useForMatching: !item.useForMatching })} /></View></Card>)}{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton block disabled={busy} onPress={finish} label={busy ? 'completing…' : 'complete private profile'} /><Text style={styles.note}>This does not enable discovery, Sparks, messages, or a 21-night room.</Text></Screen>;
}

function Check({ checked, onPress, label }: { checked: boolean; onPress: () => void; label: string }) { return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={styles.check}><Text style={styles.checkIcon}>{checked ? '✓' : '○'}</Text><Text style={styles.checkLabel}>{label}</Text></Pressable>; }
function Choice({ selected, onPress, label, compact = false }: { selected: boolean; onPress: () => void; label: string; compact?: boolean }) { return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.choice, compact && styles.choiceCompact, selected && styles.choiceOn]}><Text style={[styles.choiceLabel, selected && styles.choiceLabelOn]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  root: { flex: 1 }, screen: { flex: 1 }, scroll: { flexGrow: 1, paddingVertical: 42 }, column: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter }, step: { fontFamily: font.body, fontSize: 10, letterSpacing: 2, color: ink.mid }, title: { marginTop: 14, fontFamily: font.displayItalic, fontSize: 36, color: ink.high }, sub: { marginTop: 12, marginBottom: 26, fontFamily: font.body, fontSize: 13.5, lineHeight: 22, color: ink.mid },
  card: { padding: 20, marginBottom: 18, gap: 12 }, objectCard: { padding: 20, marginBottom: 14 }, label: { fontFamily: font.body, fontSize: 10, letterSpacing: 1.5, color: ink.mid }, input: { minHeight: 50, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: surface.border, color: ink.high, fontFamily: font.body, fontSize: 14 }, noteInput: { marginTop: 14, minHeight: 76, paddingTop: 13, textAlignVertical: 'top' }, action: { marginTop: 12 }, check: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 }, checkIcon: { width: 20, fontFamily: font.body, color: moon.present }, checkLabel: { flex: 1, fontFamily: font.body, fontSize: 13, lineHeight: 20, color: ink.high },
  options: { gap: 10, marginBottom: 24 }, choice: { borderWidth: 1, borderColor: surface.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 }, choiceCompact: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999 }, choiceOn: { borderColor: moon.present, backgroundColor: 'rgba(168,155,240,0.14)' }, choiceLabel: { fontFamily: font.body, fontSize: 13, color: ink.mid }, choiceLabelOn: { color: ink.high }, pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 }, flex: { flex: 1 }, textButton: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 12 }, textButtonLabel: { fontFamily: font.body, fontSize: 12.5, color: moon.present }, result: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: surface.border, paddingVertical: 13 }, resultTitle: { fontFamily: font.body, fontSize: 13.5, color: ink.high }, meta: { marginTop: 5, fontFamily: font.body, fontSize: 10.5, lineHeight: 17, color: ink.mid }, plus: { fontFamily: font.display, fontSize: 24, color: moon.present }, smallAction: { padding: 7 }, smallActionLabel: { fontFamily: font.body, fontSize: 16, color: ink.mid }, removeLabel: { fontFamily: font.body, fontSize: 20, color: '#F2A8B8' }, objectTitle: { marginTop: 5, fontFamily: font.display, fontSize: 23, color: ink.high }, error: { marginVertical: 16, fontFamily: font.body, fontSize: 12.5, lineHeight: 20, color: '#F2A8B8' }, note: { marginTop: 18, fontFamily: font.body, fontSize: 11.5, lineHeight: 19, color: ink.faint },
});
