import { useState, useRef, useEffect } from 'react';
import { Building, Search, X, Edit3 } from 'lucide-react';
import { searchInstitutions } from '../data/institutions';

export default function InstitutionAutocomplete({ value, onChange, placeholder = 'Type your college/school name...', label = 'Institution Name *', error }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [customName, setCustomName] = useState('');

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const customInputRef = useRef(null);

    // Sync external value
    useEffect(() => {
        if (!isOtherSelected) {
            setQuery(value || '');
        }
    }, [value, isOtherSelected]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleInput = (e) => {
        const v = e.target.value;
        setQuery(v);
        onChange(v);
        setActiveIdx(-1);

        if (v.length >= 2) {
            const results = searchInstitutions(v, 7);
            setSuggestions([...results, 'Other (Type manually)']);
            setShowDropdown(true);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    const selectSuggestion = (name) => {
        if (name === 'Other (Type manually)') {
            setIsOtherSelected(true);
            setQuery('');
            onChange(''); // Clear the main value until they type
            setSuggestions([]);
            setShowDropdown(false);
            setTimeout(() => customInputRef.current?.focus(), 50);
        } else {
            setIsOtherSelected(false);
            setQuery(name);
            onChange(name);
            setSuggestions([]);
            setShowDropdown(false);
            inputRef.current?.blur();
        }
    };

    const handleKeyDown = (e) => {
        if (!showDropdown) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && activeIdx >= 0) {
            e.preventDefault();
            selectSuggestion(suggestions[activeIdx]);
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    const clearInput = () => {
        setQuery('');
        onChange('');
        setIsOtherSelected(false);
        setCustomName('');
        setSuggestions([]);
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const handleCustomChange = (e) => {
        const v = e.target.value;
        setCustomName(v);
        onChange(v);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {label && <label className="label">{label}</label>}

            {!isOtherSelected ? (
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none', zIndex: 1 }}>
                        <Building size={16} />
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        className="input"
                        style={{
                            paddingLeft: 42, paddingRight: 40,
                            borderColor: showDropdown ? '#3B82F6' : (error ? '#EF4444' : undefined),
                        }}
                        placeholder={placeholder}
                        value={query}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (query.length >= 2) {
                                const results = searchInstitutions(query, 7);
                                setSuggestions([...results, 'Other (Type manually)']);
                                setShowDropdown(true);
                            }
                        }}
                        autoComplete="off"
                    />
                    {query && (
                        <button type="button" onClick={clearInput} style={{
                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', color: '#64748B',
                            padding: 4, display: 'flex',
                        }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ position: 'relative', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3B82F6', pointerEvents: 'none', zIndex: 1 }}>
                        <Edit3 size={16} />
                    </div>
                    <input
                        ref={customInputRef}
                        type="text"
                        className="input"
                        style={{ paddingLeft: 42, paddingRight: 80, borderColor: '#3B82F6' }}
                        placeholder="Type exact institution name..."
                        value={customName}
                        onChange={handleCustomChange}
                        autoComplete="off"
                    />
                    <button type="button" onClick={clearInput} style={{
                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 6, cursor: 'pointer',
                        color: '#3B82F6', fontSize: 12, fontWeight: 600, padding: '4px 10px',
                    }}>
                        Reset Search
                    </button>
                </div>
            )}

            {error && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{error}</p>}

            {/* Dropdown */}
            {showDropdown && suggestions.length > 0 && !isOtherSelected && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: '#1E293B', border: '1px solid #3B82F6', borderRadius: 10,
                    zIndex: 9999, overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    maxHeight: 280, display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {suggestions.map((name, i) => (
                            <div
                                key={name}
                                onMouseDown={(e) => { e.preventDefault(); selectSuggestion(name); }}
                                style={{
                                    padding: '10px 16px', cursor: 'pointer', fontSize: 14,
                                    color: i === activeIdx ? '#F8FAFC' : (name === 'Other (Type manually)' ? '#94A3B8' : '#CBD5E1'),
                                    background: i === activeIdx ? 'rgba(59,130,246,0.2)' : 'transparent',
                                    borderBottom: i < suggestions.length - 1 ? '1px solid #334155' : 'none',
                                    transition: 'background 0.1s',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    fontStyle: name === 'Other (Type manually)' ? 'italic' : 'normal',
                                }}
                                onMouseEnter={() => setActiveIdx(i)}
                            >
                                {name === 'Other (Type manually)' ? (
                                    <>
                                        <Edit3 size={14} color="#64748B" />
                                        <span>Can't find it? <strong style={{ color: '#F8FAFC' }}>Type manually instead</strong></span>
                                    </>
                                ) : (
                                    <span style={{ color: '#3B82F6', fontWeight: 600 }}>
                                        {highlightMatch(name, query)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

// Highlight the matching part of the text
function highlightMatch(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark style={{ background: 'rgba(59,130,246,0.25)', color: '#93c5fd', borderRadius: 2 }}>
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}
