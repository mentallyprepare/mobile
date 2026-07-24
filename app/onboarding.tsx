import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../src/components/Card';
import NightBackground from '../src/components/NightBackground';
import PrimaryButton from '../src/components/PrimaryButton';
import Reveal from '../src/components/Reveal';
import { completeInitialAccountSetup } from '../src/backend/accountSetup';
import { useAccountSetup } from '../src/backend/AccountSetupProvider';
import {
  addManualIdentityObject, addProviderMusic, advanceIdentityStage, completeIdentityOnboarding,
  getIdentityState, reorderIdentityShelf, searchMusic, setSocialIntentions, updateIdentityObject,
  type IdentityState, type MusicCandidate,
} from '../src/backend/identityOnboarding';
import { saveOnboardingProgress } from '../src/backend/onboarding';
import { removeShelfItem, type ShelfItem } from '../src/backend/taste';
import { cosmos, font, ink, layout, moon, radius, surface } from '../src/theme';

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
  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Reveal>
            <ScrollView
              contentContainerStyle={styles.scroll}
              contentInsetAdjustmentBehavior="automatic"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.column}>
                <View style={styles.brandRow} accessibilityRole="header">
                  <View style={styles.brandMark} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    <View style={styles.brandMoon} />
                    <View style={styles.brandOrbit} />
                  </View>
                  <Text style={styles.brandName}>MENTALLY PREPARE</Text>
                  <Text style={styles.privateTag}>PRIVATE</Text>
                </View>
                {children}
              </View>
            </ScrollView>
          </Reveal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Heading({ step, title, body }: { step: string; title: string; body: string }) {
  const current = Number(step.slice(0, 1)) || 1;
  return (
    <View style={styles.heading}>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={`Onboarding step ${current} of 5`}
        accessibilityValue={{ min: 1, max: 5, now: current }}
        style={styles.progressRail}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <View key={index} style={[styles.progressSegment, index < current && styles.progressSegmentOn]} />
        ))}
      </View>
      <Text style={styles.step}>{step}</Text>
      <Text accessibilityRole="header" maxFontSizeMultiplier={1.35} style={styles.title}>{title}</Text>
      <Text maxFontSizeMultiplier={1.5} style={styles.sub}>{body}</Text>
    </View>
  );
}

function AccountStage({ initialName, onDone }: { initialName: string; onDone: () => Promise<void> }) {
  const [name, setName] = useState(initialName); const [age, setAge] = useState(false); const [terms, setTerms] = useState(false); const [privacy, setPrivacy] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const ready = name.trim().length >= 2 && age && terms && privacy && !busy;
  const saveDraft = async () => { if (name.trim().length >= 2) await saveOnboardingProgress({ currentStep: 'display_identity', completedSteps: ['account', 'age_confirmation'], draftData: { displayName: name.trim() }, completedAt: null }).catch(() => undefined); };
  const finish = async () => { if (!ready) return; setBusy(true); setError(null); try { await completeInitialAccountSetup({ anonymousName: name, ageConfirmed: age, termsAccepted: terms, privacyAccepted: privacy }); await onDone(); } catch { setError('Private account setup could not be completed.'); } finally { setBusy(false); } };
  return <Screen><View style={styles.welcomeVisual} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><View style={styles.welcomeHalo}><View style={styles.welcomeMoon} /></View><View style={styles.welcomeStarA} /><View style={styles.welcomeStarB} /></View><Heading step="1 OF 5 · PRIVATE ACCOUNT" title="a name for your corner of the night." body="This is yours before it is social. Your profile begins private, and Discover remains closed." /><Card accent style={styles.card}><Text style={styles.fieldLabel}>WHAT SHOULD WE CALL YOU?</Text><TextInput accessibilityLabel="Display name" autoCapitalize="words" value={name} onChangeText={setName} onBlur={() => void saveDraft()} style={styles.input} placeholder="Your display name" placeholderTextColor={ink.low} maxLength={40} /><View style={styles.privacyPromise}><Text style={styles.lock}>◌</Text><Text style={styles.privacyPromiseText}>Nothing here makes you discoverable.</Text></View><Check checked={age} onPress={() => setAge(!age)} label="I confirm I am 18 or older." /><Check checked={terms} onPress={() => setTerms(!terms)} label="I agree to the terms." /><Check checked={privacy} onPress={() => setPrivacy(!privacy)} label="I accept the privacy notice." />{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}<View style={styles.action}><PrimaryButton block disabled={!ready} onPress={finish} label={busy ? 'saving…' : 'continue privately'} /></View></Card></Screen>;
}

function SocialStage({ identity, setIdentity, onDone }: { identity: IdentityState; setIdentity: (value: IdentityState) => void; onDone: () => Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const toggle = async (id: string) => {
    const next = identity.selectedIntentionIds.includes(id) ? identity.selectedIntentionIds.filter((value) => value !== id) : [...identity.selectedIntentionIds, id];
    setIdentity({ ...identity, selectedIntentionIds: next });
    try { await setSocialIntentions(next); } catch { setIdentity(identity); setError('That choice could not be saved.'); }
  };
  const next = async () => { if (!identity.selectedIntentionIds.length) return; setBusy(true); try { await advanceIdentityStage('music_selection', [...baseCompleted, 'social_intention']); await onDone(); } catch { setError('Your progress could not be saved.'); } finally { setBusy(false); } };
  return <Screen><Heading step="2 OF 5 · YOUR INTENTION" title="what would feel good to find here?" body="Choose as many as feel true. These guide your experience, but they never reveal your private notes." /><View style={styles.selectionHint}><Text style={styles.selectionHintText}>SELECT ALL THAT APPLY</Text><Text accessibilityLiveRegion="polite" style={styles.selectionCount}>{identity.selectedIntentionIds.length} selected</Text></View><View style={styles.options}>{identity.intentions.map((item) => <Choice key={item.id} selected={identity.selectedIntentionIds.includes(item.id)} onPress={() => void toggle(item.id)} label={item.label} />)}</View>{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton block disabled={!identity.selectedIntentionIds.length || busy} onPress={next} label="build my music identity" /></Screen>;
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
  return <Screen><Heading step="3 OF 5 · MUSIC IDENTITY" title="build your first shelf." body="Begin with music. Books and films will arrive only when their real catalog and backend are ready." /><SelectionMeter artists={artists} songs={songs} />{identity.shelf.length ? <Card style={styles.card}><Text style={styles.label}>YOUR SELECTION · SAVED</Text>{identity.shelf.map((item, index) => <View key={item.id} style={styles.result}><View style={styles.flex}><Text style={styles.resultTitle}>{item.title}</Text><Text style={styles.meta}>{item.objectType}{item.creatorName ? ` · ${item.creatorName}` : ''}</Text></View><Pressable accessibilityLabel="move earlier" disabled={index === 0} onPress={() => void move(index, -1)} style={styles.smallAction}><Text style={styles.smallActionLabel}>↑</Text></Pressable><Pressable accessibilityLabel="move later" disabled={index === identity.shelf.length - 1} onPress={() => void move(index, 1)} style={styles.smallAction}><Text style={styles.smallActionLabel}>↓</Text></Pressable><Pressable accessibilityLabel={`remove ${item.title}`} onPress={() => void remove(item.id)} style={styles.smallAction}><Text style={styles.removeLabel}>×</Text></Pressable></View>)}</Card> : null}<Card style={styles.card}><View style={styles.row}><TextInput value={query} onChangeText={setQuery} style={[styles.input, styles.flex]} placeholder="search artists, songs, albums" placeholderTextColor={ink.low} /><Pressable onPress={() => void runSearch()} style={styles.textButton}><Text style={styles.textButtonLabel}>{searching ? 'searching…' : 'search'}</Text></Pressable></View>{results.length ? <View style={styles.resultGrid}>{results.slice(0, 12).map((item) => <MusicResult key={item.providerObjectId} item={item} onPress={() => void addProvider(item)} />)}</View> : query.trim().length >= 2 && !searching ? <Text style={styles.emptySearch}>No real catalog results yet. Try another spelling or add it manually.</Text> : null}</Card><Card style={styles.card}><Text style={styles.label}>MANUAL FALLBACK</Text><View style={styles.pills}>{(['artist','song','album'] as const).map((type) => <Choice key={type} compact label={type} selected={manualType === type} onPress={() => setManualType(type)} />)}</View><TextInput value={manualTitle} onChangeText={setManualTitle} style={styles.input} placeholder="title" placeholderTextColor={ink.low} /><TextInput value={manualCreator} onChangeText={setManualCreator} style={styles.input} placeholder="artist, optional" placeholderTextColor={ink.low} /><Pressable onPress={() => void addManual()} style={styles.textButton}><Text style={styles.textButtonLabel}>add privately</Text></Pressable></Card>{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton block disabled={artists < 5 || songs < 5} onPress={next} label="add what it means" /></Screen>;
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
  return <Screen><Heading step="5 OF 5 · PRIVACY REVIEW" title="you decide what travels." body="Your profile remains private and discovery stays off. These choices are stored now for any future opt-in." />{identity.shelf.map((item) => <Card key={item.id} style={styles.objectCard}><Text style={styles.objectTitle}>{item.title}</Text><Text style={styles.meta}>{item.personalNote ? 'Has personal meaning · ' : ''}{item.visibility} · {item.useForMatching ? 'may influence matching' : 'excluded from matching'}</Text><View style={styles.pills}><Choice compact label="private" selected={item.visibility === 'private'} onPress={() => void patchItem(item, { visibility: 'private' })} /><Choice compact label="profile later" selected={item.visibility === 'profile'} onPress={() => void patchItem(item, { visibility: 'profile' })} /><Choice compact label="use for matching" selected={item.useForMatching} onPress={() => void patchItem(item, { useForMatching: !item.useForMatching })} /></View></Card>)}{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton block disabled={busy} onPress={finish} label={busy ? 'completing…' : 'complete private profile'} /><Text style={styles.note}>This does not enable Discover, messaging, or a 21-night room.</Text></Screen>;
}

function Check({ checked, onPress, label }: { checked: boolean; onPress: () => void; label: string }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={label} hitSlop={4} onPress={onPress} style={({ pressed }) => [styles.check, pressed && styles.pressed]}><View style={[styles.checkBox, checked && styles.checkBoxOn]}><Text style={styles.checkIcon}>{checked ? '✓' : ''}</Text></View><Text maxFontSizeMultiplier={1.5} style={styles.checkLabel}>{label}</Text></Pressable>;
}
function Choice({ selected, onPress, label, compact = false }: { selected: boolean; onPress: () => void; label: string; compact?: boolean }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.choice, compact && styles.choiceCompact, selected && styles.choiceOn, pressed && styles.pressed]}><Text maxFontSizeMultiplier={1.4} style={[styles.choiceLabel, selected && styles.choiceLabelOn]}>{label}</Text><Text style={[styles.choiceMark, selected && styles.choiceMarkOn]}>{selected ? '✓' : '+'}</Text></Pressable>;
}

function SelectionMeter({ artists, songs }: { artists: number; songs: number }) {
  const complete = Math.min(artists, 5) + Math.min(songs, 5);
  return (
    <Card accent style={styles.meterCard}>
      <View accessibilityLiveRegion="polite" accessibilityRole="progressbar" accessibilityLabel="Music selection" accessibilityValue={{ min: 0, max: 10, now: complete }}>
        <View style={styles.meterTop}><View><Text style={styles.meterEyebrow}>YOUR LIVE SELECTION</Text><Text style={styles.meterNumber}>{complete}<Text style={styles.meterTotal}> / 10</Text></Text></View><Text style={styles.meterSaved}>SAVED PRIVATELY</Text></View>
        <View style={styles.meterRows}><View style={styles.meterRow}><Text style={styles.meterLabel}>Artists</Text><View style={styles.meterTrack}><View style={[styles.meterFill, { width: `${Math.min(artists, 5) * 20}%` }]} /></View><Text style={styles.meterValue}>{artists}/5</Text></View><View style={styles.meterRow}><Text style={styles.meterLabel}>Songs</Text><View style={styles.meterTrack}><View style={[styles.meterFillRose, { width: `${Math.min(songs, 5) * 20}%` }]} /></View><Text style={styles.meterValue}>{songs}/5</Text></View></View>
      </View>
    </Card>
  );
}

function MusicResult({ item, onPress }: { item: MusicCandidate; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Add ${item.title}${item.creatorName ? ` by ${item.creatorName}` : ''}`} onPress={onPress} style={({ pressed }) => [styles.musicTile, pressed && styles.pressed]}>
      {item.imageUrl ? <Image accessibilityIgnoresInvertColors accessible={false} source={{ uri: item.imageUrl }} style={styles.artwork} /> : <View style={styles.artworkFallback}><Text style={styles.artworkGlyph}>♫</Text></View>}
      <View style={styles.musicTileCopy}><Text numberOfLines={2} style={styles.resultTitle}>{item.title}</Text><Text numberOfLines={1} style={styles.meta}>{item.creatorName ?? item.objectType}</Text></View><View style={styles.addBadge}><Text style={styles.addBadgeText}>+</Text></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  scroll: { flexGrow: 1, paddingTop: 18, paddingBottom: 72 },
  column: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter },
  brandRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  brandMark: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  brandMoon: { width: 12, height: 12, borderRadius: 6, backgroundColor: cosmos.lilac },
  brandOrbit: { position: 'absolute', width: 25, height: 10, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(201,190,255,0.42)', transform: [{ rotate: '-24deg' }] },
  brandName: { marginLeft: 8, fontFamily: font.bodyStrong, fontSize: 9, letterSpacing: 1.8, color: ink.high },
  privateTag: { marginLeft: 'auto', paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, borderColor: surface.border, fontFamily: font.bodyStrong, fontSize: 8, letterSpacing: 1.2, color: cosmos.success },
  heading: { marginBottom: 26 },
  progressRail: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  progressSegment: { flex: 1, height: 3, borderRadius: 99, backgroundColor: 'rgba(239,234,255,0.10)' },
  progressSegmentOn: { backgroundColor: cosmos.lavender },
  step: { fontFamily: font.bodyStrong, fontSize: 9, letterSpacing: 1.9, color: cosmos.lavender },
  title: { marginTop: 13, fontFamily: font.displayItalic, fontSize: 39, lineHeight: 44, color: ink.high },
  sub: { marginTop: 12, fontFamily: font.body, fontSize: 13.5, lineHeight: 22, color: ink.mid },
  welcomeVisual: { height: 104, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  welcomeHalo: { width: 92, height: 92, borderRadius: 46, borderWidth: 1, borderColor: 'rgba(201,190,255,0.18)', backgroundColor: 'rgba(127,90,142,0.10)', alignItems: 'center', justifyContent: 'center', shadowColor: cosmos.lavender, shadowOpacity: 0.18, shadowRadius: 30 },
  welcomeMoon: { width: 46, height: 46, borderRadius: 23, backgroundColor: cosmos.lilac, shadowColor: cosmos.lilac, shadowOpacity: 0.22, shadowRadius: 16 },
  welcomeStarA: { position: 'absolute', width: 3, height: 3, borderRadius: 2, backgroundColor: ink.high, top: 13, right: 78 },
  welcomeStarB: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: cosmos.rose, bottom: 18, left: 72 },
  card: { padding: 22, marginBottom: 18, gap: 12 },
  objectCard: { padding: 20, marginBottom: 14 },
  fieldLabel: { fontFamily: font.bodyStrong, fontSize: 9, letterSpacing: 1.5, color: ink.mid },
  label: { fontFamily: font.bodyStrong, fontSize: 9, letterSpacing: 1.5, color: ink.mid },
  input: { minHeight: 54, paddingHorizontal: 16, borderRadius: radius.medium, borderWidth: 1, borderColor: surface.border, backgroundColor: 'rgba(5,3,17,0.26)', color: ink.high, fontFamily: font.body, fontSize: 14 },
  noteInput: { marginTop: 14, minHeight: 88, paddingTop: 14, textAlignVertical: 'top' },
  privacyPromise: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 11, paddingHorizontal: 12, borderRadius: radius.small, backgroundColor: 'rgba(156,205,184,0.065)' },
  lock: { fontFamily: font.display, fontSize: 18, color: cosmos.success },
  privacyPromiseText: { flex: 1, fontFamily: font.body, fontSize: 11, color: cosmos.success },
  action: { marginTop: 12 },
  check: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  checkBox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1, borderColor: ink.faint, alignItems: 'center', justifyContent: 'center' },
  checkBoxOn: { backgroundColor: cosmos.lavender, borderColor: cosmos.lavender },
  checkIcon: { fontFamily: font.bodyStrong, fontSize: 12, color: sky.late },
  checkLabel: { flex: 1, fontFamily: font.body, fontSize: 13, lineHeight: 20, color: ink.high },
  selectionHint: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  selectionHintText: { fontFamily: font.bodyStrong, fontSize: 9, letterSpacing: 1.4, color: ink.mid },
  selectionCount: { marginLeft: 'auto', fontFamily: font.bodyStrong, fontSize: 10, color: cosmos.lilac },
  options: { gap: 10, marginBottom: 24 },
  choice: { minHeight: 56, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: surface.border, borderRadius: radius.medium, paddingHorizontal: 17, paddingVertical: 14, backgroundColor: 'rgba(248,242,255,0.022)' },
  choiceCompact: { minHeight: 40, flexGrow: 0, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill },
  choiceOn: { borderColor: cosmos.selectedBorder, backgroundColor: cosmos.selectedFill },
  choiceLabel: { flex: 1, fontFamily: font.body, fontSize: 13, color: ink.mid },
  choiceLabelOn: { color: ink.high },
  choiceMark: { marginLeft: 10, fontFamily: font.bodyStrong, fontSize: 15, color: ink.faint },
  choiceMarkOn: { color: cosmos.lilac },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  meterCard: { padding: 20, marginBottom: 18 },
  meterTop: { flexDirection: 'row', alignItems: 'flex-start' },
  meterEyebrow: { fontFamily: font.bodyStrong, fontSize: 8, letterSpacing: 1.5, color: ink.mid },
  meterNumber: { marginTop: 5, fontFamily: font.display, fontSize: 34, color: ink.high },
  meterTotal: { fontSize: 19, color: ink.mid },
  meterSaved: { marginLeft: 'auto', fontFamily: font.bodyStrong, fontSize: 8, letterSpacing: 1, color: cosmos.success },
  meterRows: { gap: 11, marginTop: 18 },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  meterLabel: { width: 43, fontFamily: font.body, fontSize: 10, color: ink.mid },
  meterTrack: { flex: 1, height: 5, overflow: 'hidden', borderRadius: 99, backgroundColor: 'rgba(239,234,255,0.09)' },
  meterFill: { height: '100%', borderRadius: 99, backgroundColor: cosmos.lavender },
  meterFillRose: { height: '100%', borderRadius: 99, backgroundColor: cosmos.rose },
  meterValue: { width: 25, textAlign: 'right', fontFamily: font.bodyStrong, fontSize: 10, color: ink.high },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  textButton: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 10 },
  textButtonLabel: { fontFamily: font.bodyStrong, fontSize: 12.5, color: cosmos.lilac },
  result: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surface.border, paddingVertical: 12 },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  musicTile: { width: '48%', minHeight: 196, overflow: 'hidden', borderRadius: radius.medium, borderWidth: StyleSheet.hairlineWidth, borderColor: surface.border, backgroundColor: 'rgba(248,242,255,0.035)' },
  artwork: { width: '100%', aspectRatio: 1, backgroundColor: surface.fill },
  artworkFallback: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(127,90,142,0.18)' },
  artworkGlyph: { fontFamily: font.display, fontSize: 38, color: cosmos.lilac },
  musicTileCopy: { padding: 11, paddingRight: 34 },
  addBadge: { position: 'absolute', right: 9, bottom: 10, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: cosmos.lilac },
  addBadgeText: { fontFamily: font.bodyStrong, fontSize: 16, color: sky.late },
  emptySearch: { marginTop: 12, fontFamily: font.body, fontSize: 11.5, lineHeight: 18, color: ink.mid },
  resultTitle: { fontFamily: font.bodyStrong, fontSize: 12.5, lineHeight: 17, color: ink.high },
  meta: { marginTop: 5, fontFamily: font.body, fontSize: 10.5, lineHeight: 17, color: ink.mid },
  plus: { fontFamily: font.display, fontSize: 24, color: cosmos.lilac },
  smallAction: { minWidth: 36, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  smallActionLabel: { fontFamily: font.body, fontSize: 16, color: ink.mid },
  removeLabel: { fontFamily: font.body, fontSize: 20, color: cosmos.danger },
  objectTitle: { marginTop: 5, fontFamily: font.display, fontSize: 24, lineHeight: 29, color: ink.high },
  error: { marginVertical: 16, fontFamily: font.body, fontSize: 12.5, lineHeight: 20, color: cosmos.danger },
  note: { marginTop: 18, fontFamily: font.body, fontSize: 11.5, lineHeight: 19, color: ink.faint },
  pressed: { opacity: 0.72 },
});